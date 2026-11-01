package web

import (
	"io/fs"
	"testing"
)

func TestAssetsContainsBuiltIndex(t *testing.T) {
	index, err := fs.ReadFile(Assets(), "index.html")
	if err != nil {
		t.Fatal(err)
	}
	if len(index) == 0 {
		t.Fatal("embedded frontend index is empty")
	}
}
