package certifications

import (
	"portfolio/internal/jsonfile"
	"testing"
	"testing/fstest"
)

func TestJSONReaderPreservesArrayOrder(t *testing.T) {
	source := jsonfile.Reader{Files: fstest.MapFS{
		"certifications.json": {Data: []byte(`[{"id":"first-in-file","order":2},{"id":"second-in-file","order":0}]`)},
	}}
	entries, err := (JSONReader{Source: source}).Certifications()
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 2 || entries[0].ID != "first-in-file" || entries[1].ID != "second-in-file" {
		t.Fatalf("JSON array order changed: %+v", entries)
	}
}
