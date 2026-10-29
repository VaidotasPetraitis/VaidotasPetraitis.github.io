package certifications

import "portfolio/internal/jsonfile"

type Reader interface {
	Certifications() ([]Entry, error)
}

type JSONReader struct{ Source jsonfile.Reader }

func (reader JSONReader) Certifications() ([]Entry, error) {
	value := []Entry{}
	err := reader.Source.Read("certifications.json", &value)
	return value, err
}
