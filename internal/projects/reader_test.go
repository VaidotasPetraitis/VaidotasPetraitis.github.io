package projects

import (
	"errors"
	"portfolio/internal/jsonfile"
	"testing"
	"testing/fstest"
)

func TestSummariesPreserveJSONOrder(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"first","order":2},{"slug":"second","order":0}]`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}

	summaries, err := reader.Summaries()

	if err != nil {
		t.Fatal(err)
	}
	if len(summaries) != 2 || summaries[0].Slug != "first" || summaries[1].Slug != "second" {
		t.Fatalf("unexpected order: %+v", summaries)
	}
}

func TestProjectReturnsMatchingSlug(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[{"slug":"shell","title":"Shell"},{"slug":"quiz","title":"Quiz"}]`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}

	project, err := reader.Project("quiz")

	if err != nil {
		t.Fatal(err)
	}
	if project.Title != "Quiz" {
		t.Fatalf("project title = %q, want Quiz", project.Title)
	}
}

func TestProjectReturnsNotFound(t *testing.T) {
	files := fstest.MapFS{"projects.json": {Data: []byte(`[]`)}}
	reader := JSONReader{Source: jsonfile.Reader{Files: files}}

	_, err := reader.Project("missing")

	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("error = %v, want ErrNotFound", err)
	}
}

func TestSummariesReturnReadError(t *testing.T) {
	reader := JSONReader{Source: jsonfile.Reader{Files: fstest.MapFS{}}}

	_, err := reader.Summaries()

	if err == nil {
		t.Fatal("expected read error")
	}
}

func TestProjectReturnsStorageError(t *testing.T) {
	reader := JSONReader{Source: jsonfile.Reader{Files: fstest.MapFS{}}}

	_, err := reader.Project("missing")

	if err == nil || errors.Is(err, ErrNotFound) {
		t.Fatalf("error = %v, want storage error", err)
	}
}
