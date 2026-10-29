# Vaidotas Petraitis portfolio

A Go executable serves a React/TypeScript portfolio, read-only API and embedded images. The interface uses a compact, IDE-inspired Explorer; [DESIGN.md](DESIGN.md) records the visual conventions.

## Build and run

Requires Go 1.26 and Node 22.12+ with npm during the build. Production needs only the executable.

```powershell
cd web
npm.cmd ci
npm.cmd run build
cd ..
go test ./internal/... ./web
go vet ./cmd/... ./internal/... ./web
go build -o bin/portfolio.exe ./cmd/portfolio
.\bin\portfolio.exe
```

Open http://127.0.0.1:8080. `scripts/build.ps1` runs the build/check sequence. Set `PORTFOLIO_ADDR` to change the listen address, for example `0.0.0.0:8080` behind a hosting platform's HTTPS proxy.

The frontend build must exist before Go can compile its embedded files. `web/dist` is generated, not source-controlled. The executable embeds everything it needs and can run from an empty directory. Node and source assets are not required at runtime.

## Development

### Formatting and readability

Run `./scripts/format.ps1` to apply gofmt to Go source and Prettier to frontend source, CSS, JSON, HTML and test/config files. Generated frontend output, dependencies and image assets are excluded. Tool versions are pinned in `web/package.json` and `web/package-lock.json`.

Run `./scripts/check.ps1` for non-mutating format checks, strict TypeScript, ESLint and go vet. `scripts/build.ps1` also runs the frontend checks before building. From `web`, `npm.cmd run format`, `npm.cmd run format:check` and `npm.cmd run lint` are available separately.

Use the editor's Prettier integration for frontend format-on-save and the Go extension's gofmt support for Go. The repository's `.editorconfig` supplies whitespace defaults without changing global editor settings. ESLint checks TypeScript, React hook usage and nested ternaries; Prettier owns formatting so the tools do not compete.

Keep domain names descriptive (`project`, `portfolio`, `selectedScreenshotIndex`), retain conventional short Go HTTP parameters and loop indices where their scope is clear, and prefer named handlers or helpers over complex inline expressions. Formatting does not replace naming or structure review.

### Running locally

After the first frontend build, run `go run ./cmd/portfolio` in one terminal and `npm.cmd run dev` from `web/` in another. Vite serves http://127.0.0.1:5173 and proxies API calls to Go. Restart Go after content changes; rebuild frontend and executable for production updates.

## Content and navigation

Authored JSON lives under `internal/data/`, with all projects in `projects.json`. A small embed declaration exposes the files without depending on feature slices. Each feature keeps its models, HTTP handlers, query interface and `JSONReader` implementation. Routes inject the concrete readers, which share one `jsonfile.Reader` for file I/O, JSON decoding and filename-wrapped errors; handlers depend only on feature queries. JSON readers preserve array order and handle decoding and lookup on each request, with no database package, startup loading or cache. File or decoding errors return a JSON error for that request. Image, date and diagram checks live in content tests. Images stay in `web/public/images`. Restart Go after editing content.

Routes: `/` (About), `/?section=experience`, `/?section=certifications` and `/projects/{slug}`. Browser history works normally. Folders expand without navigation. Project selection is direct. On mobile, Browse portfolio exposes the same navigation. Gallery thumbnails open original images in a keyboard-accessible dialog; Escape closes it and arrow keys change images.

The About portrait uses `portrait-banner.png`, an image-edited transparent cutout matched to the approved mockup, with natural hair edges and a broader shoulder crop. It already faces left. The banner graphics and project diagrams are native CSS/SVG.

## API

- `GET /api/v1/profile`: profile, biography, focus, education and contact links.
- `GET /api/v1/experience`: ordered roles and highlights.
- `GET /api/v1/projects`: ordered Explorer summaries, without detail content.
- `GET /api/v1/projects/{slug}`: project detail, technologies, diagram, capabilities and screenshots.
- `GET /api/v1/explorer`: Explorer categories, diagram icons and connection kinds.
- `GET /api/v1/certifications`: ordered credentials and verification links.
- `GET /healthz`: `{"status":"ok"}`.

Example: `curl.exe http://127.0.0.1:8080/api/v1/projects/quiz`.

Unknown API routes and projects return JSON 404. Unsupported endpoint methods return 405 with `Allow`. Errors follow `{"error":{"code":"project_not_found","message":"Project not found."}}`. Missing assets return HTTP 404 and never the React entry file. A nonexistent project page initially receives the client shell, then shows not found after its API returns 404.

## Verification

Go tests live beside the files they test: feature handler and reader tests, shared JSON reader tests, embedded-content checks, and HTTP route, static-serving, logging and process-helper checks. Tests use small in-memory JSON fixtures and separate named tests for success, rejection and failure. Content tests verify real image files and diagram references. Tests do not open listeners or register signal handlers.

The latest Go check measured 42 production functions: maximum statement-coverage CRAP 4.000, none above 4, and 91.3% statement coverage. The calculation uses cyclomatic complexity and Go statement coverage across cmd/, internal/ and web/embed.go; tests, generated files, third-party dependencies and TypeScript are excluded. There is no persistent metric gate.

```powershell
# While the built Go server is running:
cd web
npm.cmd run smoke
```

This is an explicit manual smoke check of the running API, original screenshot delivery and routing, with bounded request timeouts. It is outside normal verification and uses no test runner. The existing in-memory Go checks can be run with `go test ./internal/... ./web`; process helpers and logging are checked in memory without opening listeners or registering signal handlers. Frontend compilation includes strict TypeScript checks.

## Publishing content

The CV, four repositories and credential pages supplied during planning are the sources for the copy. Review the final wording and preferred LinkedIn URL before public deployment. The portfolio does not claim that repository projects were deployed or performance-tested. No AI API is called by this application. Hosting and domain configuration remain separate from this local implementation.
