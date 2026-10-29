package jsonfile

import (
	"encoding/json"
	"errors"
	"io/fs"
	"strings"
	"testing"
	"testing/fstest"
)

func TestReadFreshJSON(t *testing.T) {
	files := fstest.MapFS{"content.json": {Data: []byte(`{"name":"Before"}`)}}
	reader := Reader{Files: files}
	var value struct{ Name string }
	if err := reader.Read("content.json", &value); err != nil {
		t.Fatal(err)
	}
	if value.Name != "Before" {
		t.Fatalf("unexpected content: %+v", value)
	}
	files["content.json"] = &fstest.MapFile{Data: []byte(`{"name":"After"}`)}
	if err := reader.Read("content.json", &value); err != nil {
		t.Fatal(err)
	}
	if value.Name != "After" {
		t.Fatal("reader reused decoded content")
	}
}

func TestReadReportsMissingFile(t *testing.T) {
	reader := Reader{Files: fstest.MapFS{}}
	var value any

	err := reader.Read("missing.json", &value)

	if !errors.Is(err, fs.ErrNotExist) {
		t.Fatalf("error = %v, want file-not-found", err)
	}
	if !strings.Contains(err.Error(), "missing.json") {
		t.Fatalf("error omits filename: %v", err)
	}
}

func TestReadReportsInvalidJSON(t *testing.T) {
	reader := Reader{Files: fstest.MapFS{"invalid.json": {Data: []byte(`{`)}}}
	var value any

	err := reader.Read("invalid.json", &value)

	var syntax *json.SyntaxError
	if !errors.As(err, &syntax) {
		t.Fatalf("error = %v, want JSON syntax error", err)
	}
	if !strings.Contains(err.Error(), "invalid.json") {
		t.Fatalf("error omits filename: %v", err)
	}
}
