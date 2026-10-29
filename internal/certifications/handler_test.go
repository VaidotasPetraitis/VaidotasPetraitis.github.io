package certifications

import (
	"encoding/json"
	"net/http/httptest"
	"portfolio/internal/jsonfile"
	"testing"
	"testing/fstest"
)

func TestHandlerReturnsCertifications(t *testing.T) {
	files := fstest.MapFS{"certifications.json": {Data: []byte(`[{"id":"azure"}]`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}
	response := httptest.NewRecorder()

	Handler(reader)(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var value []Entry
	if err := json.Unmarshal(response.Body.Bytes(), &value); err != nil {
		t.Fatal(err)
	}
	if len(value) != 1 || value[0].ID != "azure" {
		t.Fatalf("unexpected response: %+v", value)
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
