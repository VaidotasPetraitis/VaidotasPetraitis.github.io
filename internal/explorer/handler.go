package explorer

import (
	"net/http"
	"portfolio/internal/httpserver/response"
)

func Handler(reader Reader) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !response.Get(w, r) {
			return
		}
		value, err := reader.Explorer()
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "invalid_content", err.Error())
			return
		}
		response.JSON(w, http.StatusOK, value)
	}
}
