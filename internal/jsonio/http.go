package jsonio

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type errorResponse struct {
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

func EncodeAndWrite(w http.ResponseWriter, r *http.Request, status int, value any) {
	body, err := json.Marshal(value)
	if err != nil {
		slog.ErrorContext(r.Context(), "encode response failed", "error", err)
		status = http.StatusInternalServerError
		body = []byte(`{"error":{"message":"Unable to encode response."}}`)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if _, err := w.Write(body); err != nil {
		slog.ErrorContext(r.Context(), "write response failed", "error", err)
	}
}

func Error(w http.ResponseWriter, r *http.Request, status int, message string) {
	var value errorResponse
	value.Error.Message = message
	EncodeAndWrite(w, r, status, value)
}
