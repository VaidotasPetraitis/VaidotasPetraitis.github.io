package projects

import (
	"encoding/json"
	"net/http/httptest"
	"portfolio/internal/jsonfile"
	"testing"
	"testing/fstest"
)

func TestListHandlerReturnsSummaries(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"quiz","title":"Quiz","capabilities":["Play"]}]`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}
	response := httptest.NewRecorder()

	ListHandler(reader)(response, httptest.NewRequest("GET", "/", nil))

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

func TestDetailHandlerReturnsSelectedProject(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"shell","title":"Shell"},{"slug":"quiz","title":"Quiz"}]`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}
	request := httptest.NewRequest("GET", "/", nil)
	request.SetPathValue("slug", "quiz")
	response := httptest.NewRecorder()

	DetailHandler(reader)(response, request)

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
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}
	request := httptest.NewRequest("GET", "/", nil)
	request.SetPathValue("slug", "missing")
	response := httptest.NewRecorder()

	DetailHandler(reader)(response, request)

	if response.Code != 404 {
		t.Fatalf("status = %d, want 404", response.Code)
	}
}

func TestListHandlerReportsReadFailure(t *testing.T) {
	reader := JSONReader{Source: jsonfile.Reader{Files: fstest.MapFS{}}}
	response := httptest.NewRecorder()

	ListHandler(reader)(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}

func TestDetailHandlerReportsReadFailure(t *testing.T) {
	reader := JSONReader{Source: jsonfile.Reader{Files: fstest.MapFS{}}}
	response := httptest.NewRecorder()

	DetailHandler(reader)(response, httptest.NewRequest("GET", "/", nil))

	if response.Code != 500 {
		t.Fatalf("status = %d, want 500", response.Code)
	}
}
