package projects

import (
	"errors"
	"portfolio/internal/jsonfile"
	"slices"
)

type SummaryReader interface {
	Summaries() ([]Summary, error)
}

type ProjectReader interface {
	Project(slug string) (Project, error)
}

var ErrNotFound = errors.New("project not found")

type JSONReader struct{ Source jsonfile.Reader }

func (reader JSONReader) Summaries() ([]Summary, error) {
	entries, err := reader.readProjects()
	if err != nil {
		return nil, err
	}
	summaries := []Summary{}
	for _, project := range entries {
		summaries = append(summaries, project.Summary)
	}
	return summaries, nil
}

func (reader JSONReader) Project(slug string) (Project, error) {
	entries, err := reader.readProjects()
	if err != nil {
		return Project{}, err
	}
	index := slices.IndexFunc(entries, func(project Project) bool { return project.Slug == slug })
	if index == -1 {
		return Project{}, ErrNotFound
	}
	return entries[index], nil
}

func (reader JSONReader) readProjects() ([]Project, error) {
	entries := []Project{}
	err := reader.Source.Read("projects.json", &entries)
	return entries, err
}
