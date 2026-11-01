package projects

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"
)

func TestDetailHandlerReturnsSelectedProject(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"shell","title":"Shell"},{"slug":"quiz","title":"Quiz"}]`)}}
	router := http.NewServeMux()
	router.HandleFunc("GET /projects/{slug}", DetailHandler(files))
	request := httptest.NewRequest("GET", "/projects/quiz", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var project Project
	if err := json.Unmarshal(response.Body.Bytes(), &project); err != nil {
		t.Fatal(err)
	}
	if project.Title != "Quiz" {
		t.Fatalf("selected project = %q, want Quiz", project.Title)
	}
}

func TestDetailHandlerReportsUnknownProject(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[]`)}}
	router := http.NewServeMux()
	router.HandleFunc("GET /projects/{slug}", DetailHandler(files))
	request := httptest.NewRequest("GET", "/projects/quiz", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != 404 {
		t.Fatalf("status = %d, want 404", response.Code)
	}
}

func TestDetailHandlerReportsReadFailure(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /projects/{slug}", DetailHandler(fstest.MapFS{}))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/projects/quiz", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}

func TestDetailHandlerReportsInvalidJSON(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /projects/{slug}", DetailHandler(fstest.MapFS{"projects.json": {Data: []byte(`{`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/projects/quiz", nil))
	if response.Code != 500 || response.Body.String() != `{"error":{"message":"Unable to load projects."}}` {
		t.Fatalf("unexpected content error: %d %q", response.Code, response.Body.String())
	}
}

func TestDetailHandlerReportsUnknownSlugInNonemptyContent(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /projects/{slug}", DetailHandler(fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"quiz"}]`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/projects/missing", nil))
	if response.Code != 404 || response.Body.String() != `{"error":{"message":"Project not found."}}` {
		t.Fatalf("unexpected not-found response: %d %q", response.Code, response.Body.String())
	}
}
