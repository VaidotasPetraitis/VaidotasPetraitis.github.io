# Vaidotas Petraitis portfolio

Go, React, TypeScript and Vite.

## Requirements

- Go 1.26.10 or newer (includes required security fixes)
- Node.js 22.12+ and npm
- PowerShell for the scripts below

## Build and run

From the repository root:

```powershell
./scripts/build.ps1
.\bin\portfolio.exe
```

Open http://127.0.0.1:8080. Set `PORTFOLIO_ADDR` to change the listen address.

The frontend must be built before Go can compile. The executable embeds the built frontend and JSON content; production needs only the executable.

## Containers and Azure

Build the Linux container from the repository root with Docker Desktop running:

```powershell
docker build --platform linux/amd64 -t portfolio:local .
docker run --rm --name portfolio-local -p 127.0.0.1:8080:8080 portfolio:local
```

The image builds and checks both frontend and backend, runs as a non-root user,
and serves the whole website on port 8080. See [the Azure deployment guide](infra/README.md)
for local verification, image publishing, and the Consumption plan Bicep template.
The template uses 0.25 vCPU, 0.5 GiB RAM and zero to one replica. Nothing is
deployed by building the image.

## Development

After the first build, run Go from the repository root:

```powershell
go run .
```

In a second terminal:

```powershell
cd web
npm.cmd run dev
```

Open http://127.0.0.1:5173. Restart Go after JSON content changes. Rebuild the frontend and executable for production updates.

Frontend navigation uses React Router. `web/src/main.tsx` provides the browser
router, and `web/src/app/App.tsx` defines the page routes. The shared layout and profile header
live in `web/src/features/portfolio/`. The About page, profile service, and schema
live in `web/src/features/about/`. Internal links use
React Router's `Link` component with a `to` prop; `NavLink` handles selected
navigation styling. Pages use `/`, `/experience`, `/certifications`, and
`/projects/:slug`, with navigation without reloads and browser Back/Forward.
Old `?section=...` bookmarks redirect to the corresponding page.

Feature-owned async functions in `web/src/features/*/service.ts` supply endpoints and
Zod schemas to `getJson`. Requests return a TypeScript result union:
`{ ok: true, data }` or `{ ok: false, error }`. HTTP errors, connection failures,
invalid responses, and cancellation are values; callers do not catch exceptions.

Components use `useRequest(getExperience)` and similar calls for loading, data,
errors, and retry. The hook owns request effects and cancellation. Effects depend
on the request function and explicit retry attempts, not their returned data.
The layout loads shared profile and navigation data, passes navigation state to
Explorer, and derives project categories from the navigation response. ProjectPage
owns project requests. Page content is fetched on mount without a client-side
query cache. React's `<title>` element sets the document title.

## Checks and formatting

```powershell
./scripts/check.ps1
./scripts/format.ps1
```

Run frontend tests separately from `web/` with `npm.cmd test`.

Run Go tests from the repository root with `go test . ./internal/... ./web`.

## Logging

The executable writes structured JSON logs to stderr using Go's `log/slog`.
Each record includes `time`, `level`, and `msg`. Server lifecycle events and
HTTP server diagnostics use the same logger.

Handlers log JSON read/decode failures with the filename and underlying cause.
The `jsonio.EncodeAndWrite` helper logs encoding and write failures. Client responses
contain safe messages using `{"error":{"message":"..."}}`.

Successful requests and request completion are not logged. The security-header middleware wraps the router directly; it does not forward
errors or log requests.

## HTTP handlers

Routes use `http.ServeMux`, and feature handlers return `http.HandlerFunc`.
Handlers call `jsonio.EncodeAndWrite` for data or `jsonio.Error` for a public error
message. JSON file helpers return descriptive errors for handlers to log.

The `internal/jsonio` package contains `ReadAndDecode` in `file.go` and HTTP
response helpers `EncodeAndWrite` and `Error` in `http.go`.
