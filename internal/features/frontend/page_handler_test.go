package frontend

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

func TestPageHandlerServesReactEntry(t *testing.T) {
	page := "<!doctype html><title>Portfolio</title>"
	files := fstest.MapFS{"index.html": {Data: []byte(page)}}
	router := http.NewServeMux()
	router.HandleFunc("GET /{$}", PageHandler(files))
	router.HandleFunc("GET /projects/{slug}", PageHandler(files))
	for _, target := range []string{"/", "/?section=experience", "/projects/quiz"} {
		t.Run(target, func(t *testing.T) {
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest("GET", target, nil))
			if response.Code != 200 || response.Body.String() != page {
				t.Fatalf("unexpected page: %d %q", response.Code, response.Body.String())
			}
			if !strings.Contains(response.Header().Get("Content-Type"), "text/html") {
				t.Fatalf("unexpected content type: %q", response.Header().Get("Content-Type"))
			}
		})
	}
}

func TestPageHandlerSupportsHEAD(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /{$}", PageHandler(fstest.MapFS{"index.html": {Data: []byte("<h1>Portfolio</h1>")}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("HEAD", "/", nil))
	if response.Code != 200 || response.Body.Len() != 0 || response.Header().Get("Content-Length") == "" {
		t.Fatalf("unexpected HEAD response: %d %q", response.Code, response.Body.String())
	}
}

func TestPageHandlerReportsMissingBuild(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /{$}", PageHandler(fstest.MapFS{}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != 500 || !strings.Contains(response.Body.String(), "Frontend build unavailable") {
		t.Fatalf("unexpected missing build response: %d %q", response.Code, response.Body.String())
	}
}
