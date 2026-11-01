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

	securityHeaders(endpoint).ServeHTTP(recorder, httptest.NewRequest("GET", "/", nil))

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
