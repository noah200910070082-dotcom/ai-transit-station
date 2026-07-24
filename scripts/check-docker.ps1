$ErrorActionPreference = "Stop"

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
$fallbackDocker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

if (-not $dockerCommand -and (Test-Path -LiteralPath $fallbackDocker)) {
  $docker = $fallbackDocker
} elseif ($dockerCommand) {
  $docker = $dockerCommand.Source
} else {
  Write-Host "Docker CLI not found. Install Docker Desktop with:"
  Write-Host "winget install --id Docker.DockerDesktop -e --accept-package-agreements --accept-source-agreements"
  exit 1
}

& $docker --version
& $docker compose version

$engineOutput = & $docker info 2>&1
if ($LASTEXITCODE -ne 0) {
  if ($engineOutput) {
    Write-Host ($engineOutput | Out-String).Trim()
  }
  Write-Host "Docker CLI exists, but the engine is not running. Start Docker Desktop, then retry."
  exit 1
}

Write-Host "Docker engine is running."
