package explorer

import "portfolio/internal/jsonfile"

type Reader interface {
	Explorer() (Explorer, error)
}

type JSONReader struct{ Source jsonfile.Reader }

func (reader JSONReader) Explorer() (Explorer, error) {
	var value Explorer
	err := reader.Source.Read("explorer.json", &value)
	return value, err
}
