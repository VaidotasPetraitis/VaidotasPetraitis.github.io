package profile

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

func TestHandlerReturnsProfile(t *testing.T) {
	files := fstest.MapFS{"profile.json": {Data: []byte(`{"name":"Ada"}`)}}
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(files))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var value Profile
	if err := json.Unmarshal(response.Body.Bytes(), &value); err != nil {
		t.Fatal(err)
	}
	if value.Name != "Ada" {
		t.Fatalf("unexpected response: %+v", value)
	}
}

func TestHandlerReportsReadFailure(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(fstest.MapFS{}))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}

func TestHandlerReportsInvalidJSON(t *testing.T) {
	var logs bytes.Buffer
	original := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&logs, nil)))
	t.Cleanup(func() { slog.SetDefault(original) })
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(fstest.MapFS{"profile.json": {Data: []byte(`{`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
	var body struct{ Error struct{ Message string } }
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Message != "Unable to load profile." {
		t.Fatalf("unexpected public error: %q", body.Error.Message)
	}
	decoder := json.NewDecoder(&logs)
	var record struct {
		Level string `json:"level"`
		Error string `json:"error"`
	}
	if err := decoder.Decode(&record); err != nil {
		t.Fatal(err)
	}
	if record.Level != "ERROR" || !strings.Contains(record.Error, `decode "profile.json"`) {
		t.Fatalf("unexpected error log: %+v", record)
	}
	if err := decoder.Decode(&record); err != io.EOF {
		t.Fatalf("expected one error log, got %v", err)
	}
}
