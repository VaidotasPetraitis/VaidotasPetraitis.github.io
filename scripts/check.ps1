$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent

Push-Location $projectRoot
try {
    $unformattedFiles = @(gofmt -l main.go main_test.go internal web/embed.go)
    if ($LASTEXITCODE -ne 0) { throw 'Go format check failed' }
    if ($unformattedFiles.Count -gt 0) {
        throw "Run scripts/format.ps1 to format: $($unformattedFiles -join ', ')"
    }

    Push-Location (Join-Path $projectRoot 'web')
    try {
        npm.cmd run check
        if ($LASTEXITCODE -ne 0) { throw 'Frontend checks failed' }
        npm.cmd test
        if ($LASTEXITCODE -ne 0) { throw 'Frontend tests failed' }
        & ./node_modules/.bin/prettier.cmd --check "../internal/data/**/*.json"
        if ($LASTEXITCODE -ne 0) { throw 'Content JSON formatting failed' }
    } finally { Pop-Location }

    go test . ./internal/... ./web
    if ($LASTEXITCODE -ne 0) { throw 'Go tests failed' }
    go vet . ./internal/... ./web
    if ($LASTEXITCODE -ne 0) { throw 'Go analysis failed' }
} finally { Pop-Location }
