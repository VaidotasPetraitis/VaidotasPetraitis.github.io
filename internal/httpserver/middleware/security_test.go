package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSecurityHeadersRunBeforeHandler(t *testing.T) {
	endpoint := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if w.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Error("security headers were not applied before the handler")
		}
		w.WriteHeader(http.StatusNoContent)
	})
	recorder := httptest.NewRecorder()

	SecurityHeaders(endpoint).ServeHTTP(recorder, httptest.NewRequest("GET", "/", nil))

	if recorder.Code != 204 {
		t.Fatalf("status = %d, want 204", recorder.Code)
	}
	if recorder.Header().Get("Content-Security-Policy") == "" {
		t.Error("missing Content-Security-Policy")
	}
	if recorder.Header().Get("Referrer-Policy") != "strict-origin-when-cross-origin" {
		t.Error("missing Referrer-Policy")
	}
}

func TestSecurityHeadersApplyToAllRoutes(t *testing.T) {
	mux := http.NewServeMux()
	endpoint := func(w http.ResponseWriter, r *http.Request) {
		if w.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Error("security headers were not set before the endpoint")
		}
		w.WriteHeader(http.StatusNoContent)
	}
	mux.HandleFunc("GET /before", endpoint)
	mux.Handle("GET /after", http.HandlerFunc(endpoint))
	handler := SecurityHeaders(mux)

	for _, path := range []string{"/before", "/after", "/missing"} {
		t.Run(path, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, httptest.NewRequest("GET", path, nil))
			wantStatus := http.StatusNoContent
			if path == "/missing" {
				wantStatus = http.StatusNotFound
			}
			if response.Code != wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, wantStatus)
			}
			if got := response.Header().Get("X-Content-Type-Options"); got != "nosniff" {
				t.Fatalf("X-Content-Type-Options = %q, want nosniff", got)
			}
		})
	}
}
