package profile

import (
	"encoding/json"
	"net/http/httptest"
	"portfolio/internal/api"
	"testing"
	"testing/fstest"
)

func TestHandlerReturnsProfile(t *testing.T) {
	files := fstest.MapFS{"profile.json": {Data: []byte(`{"name":"Ada"}`)}}
	router := api.NewRouter()
	router.GET("/", Handler(files))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var value Profile
	if err := json.Unmarshal(response.Body.Bytes(), &value); err != nil {
		t.Fatal(err)
	}
	if value.Name != "Ada" {
		t.Fatalf("unexpected response: %+v", value)
	}
}

func TestHandlerReportsReadFailure(t *testing.T) {
	router := api.NewRouter()
	router.GET("/", Handler(fstest.MapFS{}))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}

func TestHandlerReportsInvalidJSON(t *testing.T) {
	router := api.NewRouter()
	router.GET("/", Handler(fstest.MapFS{"profile.json": {Data: []byte(`{`)}}))
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("GET", "/", nil))
	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
	var body struct{ Error struct{ Message string } }
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Message != "Unable to load profile." {
		t.Fatalf("unexpected public error: %q", body.Error.Message)
	}
}
