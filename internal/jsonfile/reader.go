// Package jsonfile provides shared JSON file decoding without feature dependencies.
package jsonfile

import (
	"encoding/json"
	"fmt"
	"io/fs"
)

type Reader struct{ Files fs.FS }

func (reader Reader) Read(name string, target any) error {
	raw, err := fs.ReadFile(reader.Files, name)
	if err != nil {
		return fmt.Errorf("%s: %w", name, err)
	}
	if err := json.Unmarshal(raw, target); err != nil {
		return fmt.Errorf("%s: %w", name, err)
	}
	return nil
}
