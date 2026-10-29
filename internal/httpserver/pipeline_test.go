package httpserver

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPipelineRunsInRegistrationOrder(t *testing.T) {
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

	pipeline(endpoint, first, second).ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))

	want := "first in, second in, endpoint, second out, first out"
	if got := strings.Join(events, ", "); got != want {
		t.Fatalf("Pipeline order = %q, want %q", got, want)
	}
}
