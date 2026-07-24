$ErrorActionPreference = "Stop"

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
$fallbackDocker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$docker = if ($dockerCommand) { $dockerCommand.Source } else { $fallbackDocker }

& $docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "SKIP: Docker engine is not running, so the regression precondition is unavailable."
  exit 0
}

& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\check-docker.ps1"
if ($LASTEXITCODE -ne 0) {
  throw "check-docker.ps1 reported failure while docker info succeeded."
}

Write-Host "PASS: check-docker.ps1 agrees that the Docker engine is running."
