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

$stdoutFile = New-TemporaryFile
$stderrFile = New-TemporaryFile

try {
  $infoProcess = Start-Process `
    -FilePath $docker `
    -ArgumentList "info" `
    -NoNewWindow `
    -PassThru `
    -RedirectStandardOutput $stdoutFile.FullName `
    -RedirectStandardError $stderrFile.FullName

  if (-not $infoProcess.WaitForExit(12000)) {
    $infoProcess.Kill()
    Write-Host "Docker CLI exists, but Docker engine did not respond within 12 seconds."
    Write-Host "Start Docker Desktop and make sure WSL2 is installed/enabled, then retry."
    exit 1
  }

  if ($infoProcess.ExitCode -ne 0) {
    $engineError = Get-Content -Raw -ErrorAction SilentlyContinue $stderrFile.FullName
    if ($engineError) {
      Write-Host $engineError.Trim()
    }
    Write-Host "Docker CLI exists, but the engine is not running. Start Docker Desktop, then retry."
    exit 1
  }

  Write-Host "Docker engine is running."
} finally {
  Remove-Item -LiteralPath $stdoutFile.FullName -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $stderrFile.FullName -Force -ErrorAction SilentlyContinue
}
