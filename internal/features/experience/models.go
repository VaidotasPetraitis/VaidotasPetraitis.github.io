package experience

type Entry struct {
	ID           string   `json:"id"`
	Role         string   `json:"role"`
	Organization string   `json:"organization"`
	Start        string   `json:"start"`
	End          string   `json:"end,omitempty"`
	Description  string   `json:"description"`
	Highlights   []string `json:"highlights"`
	Order        int      `json:"order"`
}
