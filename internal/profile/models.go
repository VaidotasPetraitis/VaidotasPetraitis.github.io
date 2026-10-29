package profile

type Link struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}
type Focus struct {
	Label string `json:"label"`
	Text  string `json:"text"`
}
type Education struct {
	Title        string `json:"title"`
	Organization string `json:"organization"`
	Period       string `json:"period"`
}
type Profile struct {
	Name        string      `json:"name"`
	Headline    string      `json:"headline"`
	Role        string      `json:"role"`
	Biography   []string    `json:"biography"`
	Focus       []Focus     `json:"focus"`
	Education   []Education `json:"education"`
	Portrait    string      `json:"portrait"`
	PortraitAlt string      `json:"portraitAlt"`
	Email       string      `json:"email"`
	Links       []Link      `json:"links"`
}
