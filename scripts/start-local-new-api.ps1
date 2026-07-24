$ErrorActionPreference = "Stop"

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  $dockerExe = $docker.Source
} else {
  $dockerExe = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
}

& "$PSScriptRoot\check-docker.ps1"
& $dockerExe compose -f "$PSScriptRoot\..\deploy\new-api.local.compose.yml" up -d
Write-Host "new-api should be available at http://localhost:3000"
