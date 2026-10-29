package explorer

type Category struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type Explorer struct {
	Categories      []Category `json:"categories"`
	DiagramIcons    []string   `json:"diagramIcons"`
	ConnectionKinds []string   `json:"connectionKinds"`
}
