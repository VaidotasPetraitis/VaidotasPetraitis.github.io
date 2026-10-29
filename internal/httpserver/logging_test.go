package httpserver

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRequestLogPreservesNormalResponse(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("ok"))
	})
	response := httptest.NewRecorder()

	requestLog(handler).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 || response.Body.String() != "ok" {
		t.Fatalf("unexpected response: %d %s", response.Code, response.Body.String())
	}
}

func TestRequestLogKeepsFirstStatus(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(201)
		w.WriteHeader(202)
	})
	response := httptest.NewRecorder()

	requestLog(handler).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 201 {
		t.Fatalf("status = %d, want 201", response.Code)
	}
}

func TestRequestLogRecoversPanic(t *testing.T) {
	handler := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("failure")
	})
	response := httptest.NewRecorder()

	requestLog(handler).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
	if !strings.Contains(response.Body.String(), `"code":"internal_error"`) {
		t.Fatalf("unexpected error: %s", response.Body.String())
	}
}

func TestRequestLogPreservesResponseAfterPanic(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(202)
		_, _ = w.Write([]byte("accepted"))
		panic("failure")
	})
	response := httptest.NewRecorder()

	requestLog(handler).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 202 || response.Body.String() != "accepted" {
		t.Fatalf("started response was changed: %d %s", response.Code, response.Body.String())
	}
}
