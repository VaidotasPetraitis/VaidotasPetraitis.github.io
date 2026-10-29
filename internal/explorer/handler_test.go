package explorer

import (
	"encoding/json"
	"net/http/httptest"
	"portfolio/internal/jsonfile"
	"testing"
	"testing/fstest"
)

func TestHandlerReturnsExplorer(t *testing.T) {
	files := fstest.MapFS{"explorer.json": {Data: []byte(`{"categories":[{"id":"software"}]}`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}
	response := httptest.NewRecorder()

	Handler(reader)(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var value Explorer
	if err := json.Unmarshal(response.Body.Bytes(), &value); err != nil {
		t.Fatal(err)
	}
	if len(value.Categories) != 1 || value.Categories[0].ID != "software" {
		t.Fatalf("unexpected response: %+v", value)
	}
}

func TestHandlerRejectsPost(t *testing.T) {
	reader := JSONReader{Source: jsonfile.Reader{Files: fstest.MapFS{}}}
	response := httptest.NewRecorder()

	Handler(reader)(response, httptest.NewRequest("POST", "/", nil))

	if response.Code != 405 {
		t.Fatalf("status = %d, want 405", response.Code)
	}
}

func TestHandlerReportsReadFailure(t *testing.T) {
	reader := JSONReader{Source: jsonfile.Reader{Files: fstest.MapFS{}}}
	response := httptest.NewRecorder()

	Handler(reader)(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}
