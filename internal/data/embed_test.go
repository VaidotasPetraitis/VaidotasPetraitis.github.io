package data_test

import (
	"io/fs"
	"portfolio/internal/certifications"
	"portfolio/internal/data"
	"portfolio/internal/experience"
	"portfolio/internal/explorer"
	"portfolio/internal/jsonfile"
	"portfolio/internal/profile"
	"portfolio/internal/projects"
	"portfolio/web"
	"slices"
	"strings"
	"testing"
	"time"
)

func TestProfileContent(t *testing.T) {
	var value profile.Profile
	source := jsonfile.Reader{Files: data.Files}
	if err := source.Read("profile.json", &value); err != nil {
		t.Fatal(err)
	}

	if value.Name == "" || value.PortraitAlt == "" {
		t.Error("profile name or portrait alt text is missing")
	}
	checkImage(t, value.Portrait)
}

func TestExperienceContent(t *testing.T) {
	var entries []experience.Entry
	source := jsonfile.Reader{Files: data.Files}
	if err := source.Read("experience.json", &entries); err != nil {
		t.Fatal(err)
	}

	if len(entries) == 0 {
		t.Fatal("experience content is empty")
	}
	ids := map[string]bool{}
	for _, entry := range entries {
		checkID(t, ids, entry.ID)
		checkDate(t, "2006-01", entry.Start)
		if entry.End != "" {
			checkDate(t, "2006-01", entry.End)
		}
	}
}

func TestCertificationContent(t *testing.T) {
	var entries []certifications.Entry
	source := jsonfile.Reader{Files: data.Files}
	if err := source.Read("certifications.json", &entries); err != nil {
		t.Fatal(err)
	}

	if len(entries) == 0 {
		t.Fatal("certification content is empty")
	}
	ids := map[string]bool{}
	for _, entry := range entries {
		checkID(t, ids, entry.ID)
		checkDate(t, "2006-01-02", entry.Issued)
		if entry.Expiry != "" {
			checkDate(t, "2006-01-02", entry.Expiry)
		}
	}
}

func TestProjectContent(t *testing.T) {
	var entries []projects.Project
	var navigation explorer.Explorer
	source := jsonfile.Reader{Files: data.Files}
	if err := source.Read("projects.json", &entries); err != nil {
		t.Fatal(err)
	}
	if err := source.Read("explorer.json", &navigation); err != nil {
		t.Fatal(err)
	}

	if len(entries) == 0 {
		t.Fatal("project content is empty")
	}
	ids := map[string]bool{}
	for _, project := range entries {
		checkID(t, ids, project.Slug)
		if !slices.ContainsFunc(navigation.Categories, func(category explorer.Category) bool { return category.ID == project.Category }) {
			t.Errorf("%s: unknown category %q", project.Slug, project.Category)
		}
		checkDiagram(t, project, navigation)
		for _, screenshot := range project.Screenshots {
			checkImage(t, screenshot.Path)
			if strings.TrimSpace(screenshot.Alt) == "" {
				t.Errorf("%s: missing screenshot alt text", project.Slug)
			}
		}
	}
}

func checkID(t *testing.T, seen map[string]bool, id string) {
	t.Helper()
	if strings.TrimSpace(id) == "" || seen[id] {
		t.Errorf("missing or duplicate ID %q", id)
	}
	seen[id] = true
}

func checkDate(t *testing.T, layout, value string) {
	t.Helper()
	if _, err := time.Parse(layout, value); err != nil {
		t.Error(err)
	}
}

func checkImage(t *testing.T, path string) {
	t.Helper()
	name := strings.TrimPrefix(path, "/")
	info, err := fs.Stat(web.Assets(), name)
	if !fs.ValidPath(name) || !strings.HasPrefix(name, "images/") || err != nil || info.IsDir() {
		t.Errorf("missing or invalid image %q", path)
	}
}

func checkDiagram(t *testing.T, project projects.Project, navigation explorer.Explorer) {
	t.Helper()
	stages := map[string]bool{}
	for _, stage := range project.Diagram.Stages {
		checkID(t, stages, stage.ID)
		if !slices.Contains(navigation.DiagramIcons, stage.Icon) {
			t.Errorf("%s: unknown icon %q", project.Slug, stage.Icon)
		}
	}
	for _, connection := range project.Diagram.Connections {
		if !stages[connection.From] || !stages[connection.To] {
			t.Errorf("%s: dangling connection %s -> %s", project.Slug, connection.From, connection.To)
		}
		if !slices.Contains(navigation.ConnectionKinds, connection.Kind) {
			t.Errorf("%s: unknown connection kind %q", project.Slug, connection.Kind)
		}
	}
}
