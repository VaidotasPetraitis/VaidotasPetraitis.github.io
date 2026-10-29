package main

import (
	"os"
	"portfolio/internal/httpserver"
	"portfolio/internal/httpserver/process"
	"portfolio/web"
)

func main() { os.Exit(process.ExitStatus(run())) }

func run() error {
	return process.ServeHTTP(httpserver.Handler(web.Assets()), process.Address())
}
