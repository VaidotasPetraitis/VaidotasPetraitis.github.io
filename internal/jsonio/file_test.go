package jsonio

import (
	"encoding/json"
	"errors"
	"io/fs"
	"strings"
	"testing"
	"testing/fstest"
)

func TestReadAndDecodeFreshJSON(t *testing.T) {
	type content struct{ Name string }
	files := fstest.MapFS{"content.json": {Data: []byte(`{"name":"Before"}`)}}
	value, err := ReadAndDecode[content](files, "content.json")
	if err != nil {
		t.Fatal(err)
	}
	if value.Name != "Before" {
		t.Fatalf("unexpected content: %+v", value)
	}
	files["content.json"] = &fstest.MapFile{Data: []byte(`{"name":"After"}`)}
	value, err = ReadAndDecode[content](files, "content.json")
	if err != nil {
		t.Fatal(err)
	}
	if value.Name != "After" {
		t.Fatal("reader reused decoded content")
	}
}

func TestReadAndDecodeReportsMissingFile(t *testing.T) {
	_, err := ReadAndDecode[any](fstest.MapFS{}, "missing.json")
	if !errors.Is(err, fs.ErrNotExist) {
		t.Fatalf("error = %v, want file-not-found", err)
	}
	if !strings.Contains(err.Error(), "missing.json") {
		t.Fatalf("error omits filename: %v", err)
	}
}

func TestReadAndDecodeReportsInvalidJSON(t *testing.T) {
	files := fstest.MapFS{"invalid.json": {Data: []byte(`{`)}}
	_, err := ReadAndDecode[any](files, "invalid.json")
	var syntax *json.SyntaxError
	if !errors.As(err, &syntax) {
		t.Fatalf("error = %v, want JSON syntax error", err)
	}
	if !strings.Contains(err.Error(), "invalid.json") {
		t.Fatalf("error omits filename: %v", err)
	}
}

func TestReadAndDecodeRejectsWrongJSONType(t *testing.T) {
	files := fstest.MapFS{"content.json": {Data: []byte(`{"name":42}`)}}
	_, err := ReadAndDecode[struct{ Name string }](files, "content.json")
	var typeError *json.UnmarshalTypeError
	if !errors.As(err, &typeError) {
		t.Fatalf("error = %v, want JSON type error", err)
	}
}
