package projects

type Stage struct {
	ID      string `json:"id"`
	Label   string `json:"label"`
	Caption string `json:"caption"`
	Icon    string `json:"icon"`
}
type Connection struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Label string `json:"label,omitempty"`
	Kind  string `json:"kind,omitempty"`
}
type Diagram struct {
	Description string       `json:"description"`
	Stages      []Stage      `json:"stages"`
	Connections []Connection `json:"connections"`
}
type Screenshot struct {
	Path    string `json:"path"`
	Alt     string `json:"alt"`
	Caption string `json:"caption"`
}
type Section struct {
	Title      string   `json:"title"`
	Paragraphs []string `json:"paragraphs"`
	Items      []string `json:"items"`
}
type Summary struct {
	Slug     string `json:"slug"`
	Title    string `json:"title"`
	Category string `json:"category"`
	Summary  string `json:"summary"`
}
type Project struct {
	Summary
	Technologies []string     `json:"technologies"`
	Source       string       `json:"source"`
	Repository   string       `json:"repository"`
	Diagram      Diagram      `json:"diagram"`
	Capabilities []string     `json:"capabilities"`
	Organization string       `json:"organization"`
	Sections     []Section    `json:"sections"`
	Screenshots  []Screenshot `json:"screenshots"`
	Note         string       `json:"note"`
}
