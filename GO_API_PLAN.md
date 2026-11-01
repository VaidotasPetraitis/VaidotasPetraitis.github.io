# Go API simplification plan

Status: implemented. Routes and handlers now use standard `net/http` types,
the response helpers preserve the existing JSON error contract, and request
logging/error forwarding have been removed. Pipeline retains security headers.

Validation: Go tests, `go vet`, formatting, and whitespace checks pass. Tests
cover malformed JSON logging, public error privacy, encoding/write failures,
successful requests without logs, route parameters, methods, and frontend files.
Coverage collection succeeds with `GOTMPDIR` set to a writable task directory.
`jsonio` has 100% statement coverage. A local Go AST check
combined cyclomatic complexity with Go statement coverage using
`CRAP = complexity² × (1 − coverage)³ + complexity`. Across 32 production functions
and closures, the maximum score is 3.10, below the limit of 4. Test code is excluded.

## Aim

Use standard `net/http` routing and handlers, retain the middleware pipeline,
and keep logging limited to useful failures. Prefer direct code and small
functions; target CRAP scores of 4 or less and verify rather than assume them.

## File structure

```text
main.go
internal/
├── data/
│   ├── embed.go
│   └── *.json
├── features/
│   ├── profile/
│   │   ├── models.go
│   │   └── handler.go
│   └── ...
├── httpserver/
│   ├── server.go
│   ├── routes.go
│   └── middleware/
│       ├── pipeline.go
│       └── security.go
└── jsonio/
    ├── file.go
    ├── file_test.go
    ├── http.go
    └── http_test.go
```

Existing frontend handlers, embedded assets, and endpoint behavior remain part
of the application. Convert all route registrations, including frontend and
health routes, to the standard mux.

## Request flow

```text
http.Server
  → Pipeline security middleware
  → http.ServeMux
  → Feature handler
  → jsonio.ReadAndDecode (for endpoints backed by JSON files)
  → jsonio.EncodeAndWrite or jsonio.Error
  → Client
```

## Pipeline and logging

Keep `middleware.Pipeline` and its named middleware registration methods. Do not
add a generic `Use` method.

Only `Pipeline` and its configuration/composition methods are exported from the
middleware package. The middleware function type and the security-header
implementation are private. Route setup calls `Pipeline.SecurityHeaders()`;
it does not call the underlying middleware function directly.

The minimal logging design removes `RequestLog` and `Pipeline.LogMiddleware`.
The pipeline still composes security headers and any future middleware. It does
not log request completion, successful requests, or duplicate handler failures.

Logging responsibilities:

- Feature handlers log JSON read/decode failures once, including the error from
  `jsonio.ReadAndDecode`, which contains the filename and underlying cause.
- `jsonio.EncodeAndWrite` logs response encoding and write failures.
- Server startup/shutdown and lifecycle failures retain their existing logging.
- Configure `slog` once in `main`; write structured JSON to stderr.

There is no error forwarding through the router or middleware. Remove
`Context.Err`, `responseWriter.SetError`, and the router's interface check.
Remove the response-writer wrapper if it has no remaining callers.

If request access logs are wanted later, add that as a separate decision. A
status-only pipeline logger cannot discover a JSON decoding error's cause.

## Standard handlers and routing

Replace `api.Router` with `http.ServeMux`. Feature handler constructors return
`http.HandlerFunc`, accepting `http.ResponseWriter` and `*http.Request`.
Use `r.PathValue` for route parameters. Remove the custom `api.Context` and
custom handler type once all callers have been converted.

Keep data models, embedded files, `jsonio.ReadAndDecode`, feature packages, server
settings, and graceful shutdown.

## JSON helpers

Provide these public functions in `internal/jsonio/http.go`:

```go
func EncodeAndWrite(w http.ResponseWriter, r *http.Request, status int, value any)
func Error(w http.ResponseWriter, r *http.Request, status int, message string)
```

`internal/jsonio/file.go` provides `ReadAndDecode[T]` for JSON files. The two
files share one package; callers use only `portfolio/internal/jsonio`.

`EncodeAndWrite` marshals before writing headers, sets the JSON content type, and writes
the status and body. On encoding failure, log the cause and send a fixed JSON
500 response. On write failure, log the cause without attempting another response.

`Error` calls `EncodeAndWrite` with a private `errorResponse` type. Preserve the existing
public response shape:

```json
{"error":{"message":"Unable to load profile."}}
```

Keep internal error details out of client responses. Do not add an extra
`writeResponse` wrapper in feature packages.

## Implementation and validation

1. Add the response helpers and private error payload type.
2. Convert API, frontend, and health handlers to standard HTTP signatures.
3. Register routes on `http.ServeMux` and retain security middleware in Pipeline.
4. Remove the custom API context/router, request logger, and error forwarding.
5. Update existing tests to preserve status codes, JSON contracts, route
   parameters, security headers, and frontend behavior. Check that malformed
   JSON produces a useful log without leaking internal details to clients.
6. Run formatting, Go tests, and `go vet`. Report any unverified complexity target.

Avoid custom handler adapters, shared mutable error state, and additional layers.
