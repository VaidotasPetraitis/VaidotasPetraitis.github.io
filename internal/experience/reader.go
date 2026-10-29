package experience

import "portfolio/internal/jsonfile"

type Reader interface {
	Experience() ([]Entry, error)
}

type JSONReader struct{ Source jsonfile.Reader }

func (reader JSONReader) Experience() ([]Entry, error) {
	value := []Entry{}
	err := reader.Source.Read("experience.json", &value)
	return value, err
}
