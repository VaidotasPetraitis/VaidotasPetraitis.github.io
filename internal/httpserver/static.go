package httpserver

import (
	"io/fs"
	"net/http"
	"path"
	"strings"
)

func canRead(w http.ResponseWriter, r *http.Request) bool {
	switch r.Method {
	case http.MethodGet, http.MethodHead:
		return true
	}
	w.Header().Set("Allow", "GET, HEAD")
	http.Error(w, "Method not allowed", 405)
	return false
}

func isProjectPage(urlPath string) bool {
	if !strings.HasPrefix(urlPath, "/projects/") {
		return false
	}
	return validProjectPath(strings.TrimPrefix(urlPath, "/projects/"))
}

func validProjectPath(slug string) bool {
	return slug != "" && !strings.Contains(slug, "/") && path.Ext(slug) == ""
}
func isPage(urlPath string) bool { return urlPath == "/" || isProjectPage(urlPath) }

func staticPages(assets fs.FS) http.Handler {
	static := http.FileServer(http.FS(assets))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !canRead(w, r) {
			return
		}
		if isPage(r.URL.Path) {
			serveIndex(w, r, assets)
			return
		}
		serveAsset(w, r, assets, static)
	})
}

func serveIndex(w http.ResponseWriter, r *http.Request, assets fs.FS) {
	index, err := fs.ReadFile(assets, "index.html")
	if err != nil {
		http.Error(w, "Frontend build unavailable", 500)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if r.Method != http.MethodHead {
		_, _ = w.Write(index)
	}
}

func isFile(assets fs.FS, name string) bool {
	if !fs.ValidPath(name) {
		return false
	}
	info, err := fs.Stat(assets, name)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func serveAsset(w http.ResponseWriter, r *http.Request, assets fs.FS, static http.Handler) {
	if !isFile(assets, strings.TrimPrefix(r.URL.Path, "/")) {
		http.NotFound(w, r)
		return
	}
	static.ServeHTTP(w, r)
}
