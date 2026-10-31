$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent

Push-Location $projectRoot
try {
    gofmt -w main.go main_test.go internal web/embed.go
    if ($LASTEXITCODE -ne 0) { throw 'Go formatting failed' }

    Push-Location (Join-Path $projectRoot 'web')
    try {
        npm.cmd run format
        if ($LASTEXITCODE -ne 0) { throw 'Frontend formatting failed' }
        & ./node_modules/.bin/prettier.cmd --write "../internal/data/**/*.json"
        if ($LASTEXITCODE -ne 0) { throw 'Content JSON formatting failed' }
    } finally { Pop-Location }
} finally { Pop-Location }
