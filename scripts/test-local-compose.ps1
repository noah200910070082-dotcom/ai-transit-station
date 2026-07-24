$ErrorActionPreference = "Stop"

$composeFile = "$PSScriptRoot\..\deploy\new-api.local.compose.yml"
$exampleEnv = "$PSScriptRoot\..\deploy\.env.new-api.local.example"
$composeText = Get-Content -Raw -LiteralPath $composeFile

if ($composeText -match "123456") {
  throw "Local compose still contains the hardcoded development password 123456."
}

if (-not (Test-Path -LiteralPath $exampleEnv)) {
  throw "Missing deploy/.env.new-api.local.example."
}

$renderedConfig = docker compose --env-file $exampleEnv -f $composeFile config 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "Local compose cannot be rendered with the documented example environment."
}

if (($renderedConfig | Out-String) -match "NEW_API_ADMIN_PASSWORD") {
  throw "Local administrator credentials are being injected into the new-api container environment."
}

Write-Host "PASS: local compose uses external configuration and renders successfully."
