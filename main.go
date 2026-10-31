package main

import (
	"cmp"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"portfolio/internal/data"
	"portfolio/internal/httpserver"
	"portfolio/web"
)

func main() {
	address := cmp.Or(os.Getenv("PORTFOLIO_ADDR"), "127.0.0.1:8080")
	handler := httpserver.Handler(web.Assets(), data.Files)
	os.Exit(exitCode(httpserver.ServeHTTP(handler, address)))
}

func exitCode(err error) int {
	if err == nil || errors.Is(err, http.ErrServerClosed) {
		return 0
	}
	slog.Error("portfolio stopped", "error", err)
	return 1
}
