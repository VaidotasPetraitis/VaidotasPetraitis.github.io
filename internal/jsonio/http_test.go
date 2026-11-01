package jsonio

import (
	"bytes"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestEncodeAndWriteJSONResponse(t *testing.T) {
	response := httptest.NewRecorder()
	request := httptest.NewRequest("GET", "/", nil)
	EncodeAndWrite(response, request, http.StatusCreated, map[string]string{"name": "Ada"})
	if response.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201", response.Code)
	}
	if response.Header().Get("Content-Type") != "application/json; charset=utf-8" {
		t.Fatalf("unexpected content type: %q", response.Header().Get("Content-Type"))
	}
	var body map[string]string
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body["name"] != "Ada" {
		t.Fatalf("unexpected body: %+v", body)
	}
}

func TestErrorResponseContainsOnlyPublicMessage(t *testing.T) {
	response := httptest.NewRecorder()
	request := httptest.NewRequest("GET", "/", nil)
	Error(response, request, http.StatusNotFound, "Project not found.")
	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", response.Code)
	}
	var body map[string]map[string]string
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body) != 1 || len(body["error"]) != 1 || body["error"]["message"] != "Project not found." {
		t.Fatalf("unexpected error response: %+v", body)
	}
}

func TestEncodingFailureReturnsJSON500BeforeCommittingStatus(t *testing.T) {
	var logs bytes.Buffer
	original := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&logs, nil)))
	t.Cleanup(func() { slog.SetDefault(original) })
	response := httptest.NewRecorder()
	request := httptest.NewRequest("GET", "/", nil)
	EncodeAndWrite(response, request, http.StatusCreated, make(chan int))
	if response.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", response.Code)
	}
	var body errorResponse
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Message != "Unable to encode response." {
		t.Fatalf("unexpected encoding error: %q", body.Error.Message)
	}
	if !strings.Contains(logs.String(), "encode response failed") {
		t.Fatalf("encoding failure was not logged: %s", logs.String())
	}
}

type disconnectedWriter struct {
	header  http.Header
	headers int
	writes  int
}

func (w *disconnectedWriter) Header() http.Header { return w.header }
func (w *disconnectedWriter) WriteHeader(int)     { w.headers++ }
func (w *disconnectedWriter) Write([]byte) (int, error) {
	w.writes++
	return 0, errors.New("client disconnected")
}

func TestResponseWriteFailureIsLogged(t *testing.T) {
	var logs bytes.Buffer
	original := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&logs, nil)))
	t.Cleanup(func() { slog.SetDefault(original) })
	writer := &disconnectedWriter{header: make(http.Header)}
	request := httptest.NewRequest("GET", "/api/v1/profile", nil)
	EncodeAndWrite(writer, request, http.StatusOK, "ok")
	if !strings.Contains(logs.String(), "client disconnected") {
		t.Fatalf("write failure was not logged: %s", logs.String())
	}
	if writer.writes != 1 || writer.headers != 1 {
		t.Fatalf("response was retried: %d headers, %d writes", writer.headers, writer.writes)
	}
}
