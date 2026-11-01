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

Successful requests and request completion are not logged. The middleware pipeline
adds security headers; it does not forward errors or log requests.

## HTTP handlers

Routes use `http.ServeMux`, and feature handlers return `http.HandlerFunc`.
Handlers call `jsonio.EncodeAndWrite` for data or `jsonio.Error` for a public error
message. JSON file helpers return descriptive errors for handlers to log.

The `internal/jsonio` package contains `ReadAndDecode` in `file.go` and HTTP
response helpers `EncodeAndWrite` and `Error` in `http.go`.
