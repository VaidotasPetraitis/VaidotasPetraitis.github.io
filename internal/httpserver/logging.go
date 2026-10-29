package httpserver

import (
	"log/slog"
	"net/http"
	"portfolio/internal/httpserver/response"
	"time"
)

func requestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		response := &responseWriter{ResponseWriter: w, status: 200}
		defer func() {
			recoverRequest(response, recover())
			slog.Info("request", "method", r.Method, "path", r.URL.Path, "status", response.status, "duration", time.Since(start))
		}()
		next.ServeHTTP(response, r)
	})
}

func recoverRequest(writer *responseWriter, failure any) {
	if failure == nil {
		return
	}
	slog.Error("request panic", "error", failure)
	if !writer.wrote {
		response.Error(writer, 500, "internal_error", "Unable to complete request.")
	}
}

type responseWriter struct {
	http.ResponseWriter
	status int
	wrote  bool
}

func (w *responseWriter) WriteHeader(status int) {
	if w.wrote {
		return
	}
	w.status = status
	w.wrote = true
	w.ResponseWriter.WriteHeader(status)
}
func (w *responseWriter) Write(body []byte) (int, error) {
	if !w.wrote {
		w.WriteHeader(200)
	}
	return w.ResponseWriter.Write(body)
}
