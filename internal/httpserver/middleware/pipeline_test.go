package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPipelineRunsMiddlewareInRegistrationOrder(t *testing.T) {
	var events []string
	first := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			events = append(events, "first in")
			next.ServeHTTP(w, r)
			events = append(events, "first out")
		})
	}
	second := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			events = append(events, "second in")
			next.ServeHTTP(w, r)
			events = append(events, "second out")
		})
	}
	endpoint := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		events = append(events, "endpoint")
	})

	mux := http.NewServeMux()
	pipeline := Pipeline{steps: []middleware{first, second}}
	mux.Handle("GET /", endpoint)
	pipeline.Handler(mux).ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))

	want := "first in, second in, endpoint, second out, first out"
	if got := strings.Join(events, ", "); got != want {
		t.Fatalf("Middleware order = %q, want %q", got, want)
	}
}

func TestPipelineMiddlewareAppliesToAllRoutes(t *testing.T) {
	mux := http.NewServeMux()
	var pipeline Pipeline
	endpoint := func(w http.ResponseWriter, r *http.Request) {
		if w.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Error("security headers were not set before the endpoint")
		}
		w.WriteHeader(http.StatusNoContent)
	}
	mux.HandleFunc("GET /before", endpoint)
	pipeline.SecurityHeaders()
	mux.Handle("GET /after", http.HandlerFunc(endpoint))
	handler := pipeline.Handler(mux)

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

func TestPipelineWithoutMiddleware(t *testing.T) {
	mux := http.NewServeMux()
	var pipeline Pipeline
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	response := httptest.NewRecorder()
	pipeline.Handler(mux).ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
}
