package frontend

import (
	"io/fs"
	"net/http"
	"strings"
)

func FilesHandler(files fs.FS) http.HandlerFunc {
	fileServer := http.FileServerFS(files)
	return func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(r.URL.Path, "/")
		info, err := fs.Stat(files, name)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		if info.IsDir() {
			http.NotFound(w, r)
			return
		}
		fileServer.ServeHTTP(w, r)
	}
}
