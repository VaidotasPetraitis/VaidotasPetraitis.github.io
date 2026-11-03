package certifications

type Entry struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Issuer       string `json:"issuer"`
	Issued       string `json:"issued"`
	Expiry       string `json:"expiry,omitempty"`
	CredentialID string `json:"credentialId,omitempty"`
	URL          string `json:"url"`
	Description  string `json:"description,omitempty"`
}
