package api

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

func TestJSONResponse(t *testing.T) {
	response := httptest.NewRecorder()
	c := Context{Writer: response, Request: httptest.NewRequest("GET", "/", nil)}
	c.JSON(http.StatusCreated, map[string]string{"name": "Ada"})
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
	c := Context{Writer: response, Request: httptest.NewRequest("GET", "/", nil)}
	c.Error(http.StatusNotFound, "Project not found.")
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
	response := httptest.NewRecorder()
	c := Context{Writer: response, Request: httptest.NewRequest("GET", "/", nil)}
	c.JSON(http.StatusCreated, make(chan int))
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
}

type disconnectedWriter struct {
	header http.Header
}

func (w *disconnectedWriter) Header() http.Header { return w.header }
func (w *disconnectedWriter) WriteHeader(int)     {}
func (w *disconnectedWriter) Write([]byte) (int, error) {
	return 0, errors.New("client disconnected")
}

func TestResponseWriteFailureIsLogged(t *testing.T) {
	var logs bytes.Buffer
	original := slog.Default()
	slog.SetDefault(slog.New(slog.NewTextHandler(&logs, nil)))
	t.Cleanup(func() { slog.SetDefault(original) })
	c := Context{Writer: &disconnectedWriter{header: make(http.Header)}}
	c.JSON(http.StatusOK, "ok")
	if !strings.Contains(logs.String(), "client disconnected") {
		t.Fatalf("write failure was not logged: %s", logs.String())
	}
}
