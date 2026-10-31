package frontend

import (
	"io/fs"
	"net/http"
	"strings"

	"portfolio/internal/api"
)

func FilesHandler(files fs.FS) api.Handler {
	fileServer := http.FileServerFS(files)
	return func(c *api.Context) {
		name := strings.TrimPrefix(c.Request.URL.Path, "/")
		info, err := fs.Stat(files, name)
		if err != nil {
			http.NotFound(c.Writer, c.Request)
			return
		}
		if info.IsDir() {
			http.NotFound(c.Writer, c.Request)
			return
		}
		fileServer.ServeHTTP(c.Writer, c.Request)
	}
}
