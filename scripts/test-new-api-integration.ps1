$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000"
$envFile = "$PSScriptRoot\..\deploy\.env.new-api.local"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing deploy/.env.new-api.local. Run npm run backend:local first."
}

$config = @{}
foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line -and -not $line.TrimStart().StartsWith("#") -and $line.Contains("=")) {
    $parts = $line.Split("=", 2)
    $config[$parts[0]] = $parts[1]
  }
}

function Invoke-NewApi {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [ValidateSet("GET", "POST", "DELETE")][string]$Method = "GET",
    [Microsoft.PowerShell.Commands.WebRequestSession]$Session,
    [object]$Body
  )

  $params = @{
    Uri = "$baseUrl$Path"
    Method = $Method
    TimeoutSec = 15
  }
  if ($Session) { $params.WebSession = $Session }
  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = $Body | ConvertTo-Json -Depth 8
  }

  $response = Invoke-RestMethod @params
  if ($response.PSObject.Properties.Name -contains "success" -and -not $response.success) {
    throw "new-api request failed for $Method $Path`: $($response.message)"
  }
  return $response
}

$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$memberSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$testUsername = "it$((Get-Random -Minimum 100000 -Maximum 999999))"
$testPassword = "T$((Get-Random -Minimum 100000000 -Maximum 999999999))x"
$testUserId = $null
$testTokenId = $null

try {
  $status = Invoke-NewApi -Path "/api/status"
  if (-not $status.data.setup) { throw "new-api is reachable but not initialized." }

  $adminLogin = Invoke-NewApi -Path "/api/user/login" -Method POST -Session $adminSession -Body @{
    username = $config.NEW_API_ADMIN_USERNAME
    password = $config.NEW_API_ADMIN_PASSWORD
  }
  if ($adminLogin.data.role -lt 10) { throw "Local administrator login did not receive an admin role." }
  $adminSession.Headers["New-Api-User"] = [string]$adminLogin.data.id

  $adminSelf = Invoke-NewApi -Path "/api/user/self" -Session $adminSession
  if ($adminSelf.data.username -ne $config.NEW_API_ADMIN_USERNAME) { throw "Administrator session was not persisted." }

  Invoke-NewApi -Path "/api/user/register" -Method POST -Body @{
    username = $testUsername
    password = $testPassword
  } | Out-Null

  $memberLogin = Invoke-NewApi -Path "/api/user/login" -Method POST -Session $memberSession -Body @{
    username = $testUsername
    password = $testPassword
  }
  if ($memberLogin.data.role -ge 10) { throw "Public registration unexpectedly created an administrator." }
  $memberSession.Headers["New-Api-User"] = [string]$memberLogin.data.id

  $memberSelf = Invoke-NewApi -Path "/api/user/self" -Session $memberSession
  $testUserId = $memberSelf.data.id

  $tokenName = "integration-$testUsername"
  Invoke-NewApi -Path "/api/token/" -Method POST -Session $memberSession -Body @{
    name = $tokenName
    remain_quota = 0
    expired_time = -1
    unlimited_quota = $true
    model_limits_enabled = $false
    model_limits = ""
    allow_ips = ""
    group = ""
    cross_group_retry = $false
  } | Out-Null

  $tokens = Invoke-NewApi -Path "/api/token/?p=1&page_size=20" -Session $memberSession
  $createdToken = $tokens.data.items | Where-Object { $_.name -eq $tokenName } | Select-Object -First 1
  if (-not $createdToken) { throw "Created token was not returned by the token list API." }
  $testTokenId = $createdToken.id

  Invoke-NewApi -Path "/api/user/models" -Session $memberSession | Out-Null
  Invoke-NewApi -Path "/api/log/self?p=1&page_size=20" -Session $memberSession | Out-Null

  $users = Invoke-NewApi -Path "/api/user/?p=1&page_size=100" -Session $adminSession
  if (-not ($users.data.items | Where-Object { $_.id -eq $testUserId })) {
    throw "Administrator user list did not include the registered member."
  }
  Invoke-NewApi -Path "/api/channel/?p=1&page_size=5&id_sort=true" -Session $adminSession | Out-Null

  Write-Host "PASS: status, admin login, registration, member login, session, tokens, models, logs, users, and channels are real and reachable."
} finally {
  if ($testTokenId) {
    try { Invoke-NewApi -Path "/api/token/$testTokenId/" -Method DELETE -Session $memberSession | Out-Null } catch { Write-Warning $_ }
  }
  if ($testUserId) {
    try { Invoke-NewApi -Path "/api/user/$testUserId" -Method DELETE -Session $adminSession | Out-Null } catch { Write-Warning $_ }
  }
}
