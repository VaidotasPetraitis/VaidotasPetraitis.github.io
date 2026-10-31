package projects

import (
	"encoding/json"
	"net/http/httptest"
	"portfolio/internal/api"
	"testing"
	"testing/fstest"
)

func TestListHandlerReturnsSummaries(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"quiz","title":"Quiz","capabilities":["Play"]}]`)}}
	router := api.NewRouter()
	router.GET("/", ListHandler(files))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var summaries []map[string]any
	if err := json.Unmarshal(response.Body.Bytes(), &summaries); err != nil {
		t.Fatal(err)
	}
	if len(summaries) != 1 || summaries[0]["slug"] != "quiz" {
		t.Fatalf("unexpected summaries: %+v", summaries)
	}
	if _, hasDetails := summaries[0]["capabilities"]; hasDetails {
		t.Fatal("list returned detail-only fields")
	}
}

func TestListHandlerReportsReadFailure(t *testing.T) {
	router := api.NewRouter()
	router.GET("/", ListHandler(fstest.MapFS{}))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}

func TestListHandlerPreservesJSONOrder(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"first","order":2},{"slug":"second","order":0}]`)}}
	router := api.NewRouter()
	router.GET("/", ListHandler(files))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	var summaries []Summary
	if err := json.Unmarshal(response.Body.Bytes(), &summaries); err != nil {
		t.Fatal(err)
	}
	if len(summaries) != 2 || summaries[0].Slug != "first" || summaries[1].Slug != "second" {
		t.Fatalf("unexpected order: %+v", summaries)
	}
}

func TestListHandlerReturnsEmptyArray(t *testing.T) {
	router := api.NewRouter()
	router.GET("/", ListHandler(fstest.MapFS{"projects.json": {Data: []byte(`[]`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != 200 || response.Body.String() != "[]" {
		t.Fatalf("unexpected empty list: %d %q", response.Code, response.Body.String())
	}
}

func TestListHandlerReportsInvalidJSON(t *testing.T) {
	router := api.NewRouter()
	router.GET("/", ListHandler(fstest.MapFS{"projects.json": {Data: []byte(`{`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != 500 || response.Body.String() != `{"error":{"message":"Unable to load projects."}}` {
		t.Fatalf("unexpected content error: %d %q", response.Code, response.Body.String())
	}
}
