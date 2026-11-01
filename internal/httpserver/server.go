package httpserver

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

func ServeHTTP(handler http.Handler, address string) error {
	httpServer := &http.Server{
		Addr:              address,
		Handler:           handler,
		ErrorLog:          slog.NewLogLogger(slog.Default().Handler(), slog.LevelError),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	shutdownRequested, requestShutdown := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer requestShutdown()

	var shutdown sync.WaitGroup
	shutdown.Go(func() {
		<-shutdownRequested.Done()
		shutdownServer(httpServer)
	})

	slog.Info("server starting", "address", address)
	listenError := httpServer.ListenAndServe()

	requestShutdown()
	shutdown.Wait()
	if listenError == http.ErrServerClosed {
		slog.Info("server stopped")
	}
	return listenError
}

func shutdownServer(httpServer *http.Server) {
	shutdownDeadline, cancelDeadline := context.WithTimeout(context.Background(), 10*time.Second)

	defer cancelDeadline()

	if err := httpServer.Shutdown(shutdownDeadline); err != nil {
		slog.Error("server shutdown failed", "error", err)
	}
}
