package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequestLogPreservesNormalResponse(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("ok"))
	})
	response := httptest.NewRecorder()

	RequestLog(handler).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

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

	RequestLog(handler).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 201 {
		t.Fatalf("status = %d, want 201", response.Code)
	}
}
