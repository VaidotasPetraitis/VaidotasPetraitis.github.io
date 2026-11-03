package jsonio

import (
	"encoding/json"
	"fmt"
	"io/fs"
)

func ReadAndDecode[T any](files fs.FS, filename string) (T, error) {
	var value T
	content, err := fs.ReadFile(files, filename)
	if err != nil {
		return value, fmt.Errorf("read %q: %w", filename, err)
	}
	if err := json.Unmarshal(content, &value); err != nil {
		return value, fmt.Errorf("decode %q: %w", filename, err)
	}
	return value, nil
}
