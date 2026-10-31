package frontend

import (
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"portfolio/internal/api"
)

func TestFilesHandlerServesStaticFiles(t *testing.T) {
	files := fstest.MapFS{
		"assets/main.js":      {Data: []byte("const ready=true")},
		"images/portrait.png": {Data: []byte("png")},
		"favicon.svg":         {Data: []byte("<svg></svg>")},
	}
	router := api.NewRouter()
	router.GET("/assets/", FilesHandler(files))
	router.GET("/images/", FilesHandler(files))
	router.GET("/favicon.svg", FilesHandler(files))
	for _, test := range []struct{ path, body, contentType string }{
		{"/assets/main.js", "const ready=true", "javascript"},
		{"/images/portrait.png", "png", "image/png"},
		{"/favicon.svg", "<svg></svg>", "image/svg+xml"},
	} {
		t.Run(test.path, func(t *testing.T) {
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest("GET", test.path, nil))
			if response.Code != 200 || response.Body.String() != test.body {
				t.Fatalf("unexpected file: %d %q", response.Code, response.Body.String())
			}
			if !strings.Contains(response.Header().Get("Content-Type"), test.contentType) {
				t.Fatalf("unexpected content type: %q", response.Header().Get("Content-Type"))
			}
		})
	}
}

func TestFilesHandlerDoesNotListDirectoriesOrServeIndexFiles(t *testing.T) {
	files := fstest.MapFS{"images/index.html": {Data: []byte("private index")}}
	router := api.NewRouter()
	router.GET("/images/", FilesHandler(files))
	for _, path := range []string{"/images/", "/images/missing.png"} {
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest("GET", path, nil))
		if response.Code != 404 || strings.Contains(response.Body.String(), "private index") {
			t.Fatalf("unexpected file response for %s: %d %q", path, response.Code, response.Body.String())
		}
	}
}

func TestFilesHandlerSupportsHEADAndRanges(t *testing.T) {
	router := api.NewRouter()
	router.GET("/assets/", FilesHandler(fstest.MapFS{"assets/main.js": {Data: []byte("const ready=true")}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("HEAD", "/assets/main.js", nil))
	if response.Code != 200 || response.Body.Len() != 0 {
		t.Fatalf("unexpected HEAD response: %d %q", response.Code, response.Body.String())
	}
	request := httptest.NewRequest("GET", "/assets/main.js", nil)
	request.Header.Set("Range", "bytes=0-4")
	response = httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != 206 || response.Body.String() != "const" {
		t.Fatalf("unexpected range response: %d %q", response.Code, response.Body.String())
	}
}
