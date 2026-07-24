$ErrorActionPreference = "Stop"

function New-RandomHexSecret([int]$ByteLength = 24) {
  $bytes = New-Object byte[] $ByteLength
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $generator.GetBytes($bytes)
  } finally {
    $generator.Dispose()
  }
  return -join ($bytes | ForEach-Object { $_.ToString("x2") })
}

function Read-EnvFile([string]$Path) {
  $values = @{}
  foreach ($line in Get-Content -LiteralPath $Path) {
    if (-not $line -or $line.TrimStart().StartsWith("#") -or -not $line.Contains("=")) {
      continue
    }
    $parts = $line.Split("=", 2)
    $values[$parts[0]] = $parts[1]
  }
  return $values
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  $dockerExe = $docker.Source
} else {
  $dockerExe = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
}

$deployDirectory = Resolve-Path "$PSScriptRoot\..\deploy"
$composeFile = Join-Path $deployDirectory "new-api.local.compose.yml"
$envFile = Join-Path $deployDirectory ".env.new-api.local"

if (-not (Test-Path -LiteralPath $envFile)) {
  $postgresPassword = New-RandomHexSecret
  $redisPassword = New-RandomHexSecret
  $sessionSecret = New-RandomHexSecret 32
  $adminPassword = New-RandomHexSecret 12

  @"
POSTGRES_USER=root
POSTGRES_PASSWORD=$postgresPassword
POSTGRES_DB=new-api
REDIS_PASSWORD=$redisPassword

SQL_DSN=postgresql://root:$postgresPassword@postgres:5432/new-api
REDIS_CONN_STRING=redis://:$redisPassword@redis:6379
TZ=Asia/Shanghai
ERROR_LOG_ENABLED=true
BATCH_UPDATE_ENABLED=true
NODE_NAME=local-new-api-node
SESSION_SECRET=$sessionSecret
SESSION_COOKIE_SECURE=false
FRONTEND_BASE_URL=http://127.0.0.1:5173

NEW_API_ADMIN_USERNAME=admin
NEW_API_ADMIN_PASSWORD=$adminPassword
"@ | Set-Content -LiteralPath $envFile -Encoding UTF8

  Write-Host "Created local secrets at deploy/.env.new-api.local (ignored by Git)."
}

& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\check-docker.ps1"
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $dockerExe compose --env-file $envFile -f $composeFile up -d
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$deadline = (Get-Date).AddMinutes(2)
$status = $null
do {
  try {
    $status = Invoke-RestMethod -Uri "http://localhost:3000/api/status" -TimeoutSec 5
  } catch {
    Start-Sleep -Seconds 2
  }
} while (-not $status -and (Get-Date) -lt $deadline)

if (-not $status) {
  Write-Host "new-api did not become ready within two minutes."
  exit 1
}

$setup = Invoke-RestMethod -Uri "http://localhost:3000/api/setup" -TimeoutSec 5
if (-not $setup.data.status) {
  $localConfig = Read-EnvFile $envFile
  $setupBody = @{
    username = $localConfig.NEW_API_ADMIN_USERNAME
    password = $localConfig.NEW_API_ADMIN_PASSWORD
    confirmPassword = $localConfig.NEW_API_ADMIN_PASSWORD
    SelfUseModeEnabled = $false
    DemoSiteEnabled = $false
  } | ConvertTo-Json

  $setupResult = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/setup" `
    -Method Post `
    -ContentType "application/json" `
    -Body $setupBody `
    -TimeoutSec 10

  if (-not $setupResult.success) {
    Write-Host "new-api setup failed: $($setupResult.message)"
    exit 1
  }
  Write-Host "Initialized the local new-api administrator account."
}

Write-Host "new-api is ready at http://localhost:3000"
Write-Host "Local administrator credentials are stored in deploy/.env.new-api.local"
