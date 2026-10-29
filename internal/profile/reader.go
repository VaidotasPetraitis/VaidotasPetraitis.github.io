package profile

import "portfolio/internal/jsonfile"

type Reader interface {
	Profile() (Profile, error)
}

type JSONReader struct{ Source jsonfile.Reader }

func (reader JSONReader) Profile() (Profile, error) {
	var value Profile
	err := reader.Source.Read("profile.json", &value)
	return value, err
}
