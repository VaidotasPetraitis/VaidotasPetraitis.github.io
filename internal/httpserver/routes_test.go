package httpserver

import (
	"net/http/httptest"
	"portfolio/internal/data"
	"strings"
	"testing"
	"testing/fstest"
)

func TestRoutesServeExpectedResponses(t *testing.T) {
	assets := fstest.MapFS{
		"index.html":      {Data: []byte("<!doctype html><title>Portfolio</title>")},
		"images/real.png": {Data: []byte("png")},
		"assets/main.js":  {Data: []byte("const ready=true")},
	}
	h := Handler(assets, data.Files)
	tests := []struct {
		method, path string
		status       int
		contentType  string
	}{
		{"GET", "/", 200, "text/html"},
		{"GET", "/?section=experience", 200, "text/html"},
		{"GET", "/projects/shell-in-go", 200, "text/html"},
		{"GET", "/projects/missing", 200, "text/html"},
		{"GET", "/api/v1/projects/missing", 404, "application/json"},
		{"GET", "/api/v1/projects/quiz", 200, "application/json"},
		{"POST", "/api/v1/projects/quiz", 405, "text/plain"},
		{"POST", "/api/v1/projects", 405, "text/plain"},
		{"GET", "/api/v1/profile", 200, "application/json"},
		{"HEAD", "/api/v1/profile", 200, "application/json"},
		{"GET", "/api/v1/experience", 200, "application/json"},
		{"POST", "/api/v1/experience", 405, "text/plain"},
		{"GET", "/api/v1/certifications", 200, "application/json"},
		{"POST", "/api/v1/certifications", 405, "text/plain"},
		{"HEAD", "/", 200, "text/html"},
		{"POST", "/", 405, "text/plain"},
		{"GET", "/api/unknown", 404, "text/plain"},
		{"POST", "/api/unknown", 404, "text/plain"},
		{"GET", "/api/v1/profile/extra", 404, "text/plain"},
		{"POST", "/api/v1/profile", 405, "text/plain"},
		{"POST", "/healthz", 405, "text/plain"},
		{"GET", "/images/missing.png", 404, "text/plain"},
		{"GET", "/images/", 404, "text/plain"},
		{"GET", "/api", 404, "text/plain"},
		{"GET", "/api/", 404, "text/plain"},
		{"GET", "/unrecognized", 404, "text/plain"},
		{"GET", "/projects/extra/path", 404, "text/plain"},
		{"GET", "/assets/main.js", 200, "javascript"},
		{"GET", "/healthz", 200, "application/json"},
		{"GET", "/api/v1/explorer", 200, "application/json"},
		{"POST", "/api/v1/explorer", 405, "text/plain"},
	}
	for _, tt := range tests {
		t.Run(tt.method+tt.path, func(t *testing.T) {
			w := httptest.NewRecorder()
			h.ServeHTTP(w, httptest.NewRequest(tt.method, tt.path, nil))
			if w.Code != tt.status {
				t.Fatalf("status %d, want %d", w.Code, tt.status)
			}
			if !strings.Contains(w.Header().Get("Content-Type"), tt.contentType) {
				t.Fatalf("content type %q", w.Header().Get("Content-Type"))
			}
			if tt.status == 405 && w.Header().Get("Allow") == "" {
				t.Fatal("missing Allow header")
			}
		})
	}
}
