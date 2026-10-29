package httpserver

import (
	"net/http/httptest"
	"testing"
	"testing/fstest"
)

func TestMissingFrontendBuild(t *testing.T) {
	response := httptest.NewRecorder()
	serveIndex(response, httptest.NewRequest("GET", "/", nil), fstest.MapFS{})
	if response.Code != 500 {
		t.Fatalf("expected unavailable frontend, got %d", response.Code)
	}
}
