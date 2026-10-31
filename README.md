# Vaidotas Petraitis portfolio

Go, React, TypeScript and Vite.

## Requirements

- Go 1.26
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
