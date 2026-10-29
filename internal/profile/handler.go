package profile

import (
	"net/http"
	"portfolio/internal/httpserver/response"
)

func Handler(reader Reader) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		value, err := reader.Profile()
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "invalid_content", err.Error())
			return
		}
		response.JSON(w, http.StatusOK, value)
	}
}
