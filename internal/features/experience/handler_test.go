package experience

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"
)

func TestHandlerReturnsExperience(t *testing.T) {
	files := fstest.MapFS{"experience.json": {Data: []byte(`[{"id":"engineer"}]`)}}
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(files))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var value []Entry
	if err := json.Unmarshal(response.Body.Bytes(), &value); err != nil {
		t.Fatal(err)
	}
	if len(value) != 1 || value[0].ID != "engineer" {
		t.Fatalf("unexpected response: %+v", value)
	}
}

func TestHandlerReportsReadFailure(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(fstest.MapFS{}))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}

func TestHandlerReportsInvalidJSON(t *testing.T) {
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(fstest.MapFS{"experience.json": {Data: []byte(`{`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
	var body struct{ Error struct{ Message string } }
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Message != "Unable to load experience." {
		t.Fatalf("unexpected public error: %q", body.Error.Message)
	}
}

func TestHandlerPreservesArrayOrder(t *testing.T) {
	files := fstest.MapFS{"experience.json": {Data: []byte(`[{"id":"first"},{"id":"second"}]`)}}
	router := http.NewServeMux()
	router.HandleFunc("GET /", Handler(files))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	var entries []Entry
	if err := json.Unmarshal(response.Body.Bytes(), &entries); err != nil {
		t.Fatal(err)
	}
	if len(entries) != 2 || entries[0].ID != "first" || entries[1].ID != "second" {
		t.Fatalf("unexpected order: %+v", entries)
	}
}
