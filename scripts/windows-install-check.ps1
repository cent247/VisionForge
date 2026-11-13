param([ValidateSet('install','uninstall')][string]$Mode)
$ErrorActionPreference = 'Stop'
$installDir = Join-Path $env:RUNNER_TEMP 'VisionForgeAcceptance'
$recordPath = 'evidence/windows-installer.json'
if ($Mode -eq 'install') {
  if (Test-Path $installDir) { throw 'Acceptance installation directory must be absent' }
  $installer = Get-ChildItem release -Filter '*.exe' | Where-Object Name -NotMatch 'uninstall' | Select-Object -First 1
  if (-not $installer) { throw 'Installer was not built' }
  $process = Start-Process -FilePath $installer.FullName -ArgumentList @('/S', "/D=$installDir") -PassThru -Wait
  if ($process.ExitCode -ne 0) { throw "Installer failed: $($process.ExitCode)" }
  $appExe = Join-Path $installDir 'VisionForge.exe'
  if (-not (Test-Path $appExe)) { throw 'Installed executable missing' }
  $record = @{ platform=(Get-CimInstance Win32_OperatingSystem).Caption; hostArchitecture=[Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString(); applicationArchitecture='x64'; installer=$installer.Name; installerSha256=(Get-FileHash $installer.FullName -Algorithm SHA256).Hash; installExitCode=$process.ExitCode; installedExecutableFound=$true; uninstallTested=$false }
  $record | ConvertTo-Json | Set-Content $recordPath
  "VF_TEST_EXECUTABLE=$appExe" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
} else {
  $uninstaller = Get-ChildItem $installDir -Filter '*uninstall*.exe' | Select-Object -First 1
  if (-not $uninstaller) { throw 'Installed uninstaller missing' }
  $process = Start-Process -FilePath $uninstaller.FullName -ArgumentList '/S' -PassThru -Wait
  if ($process.ExitCode -ne 0) { throw "Uninstaller failed: $($process.ExitCode)" }
  $appExe = Join-Path $installDir 'VisionForge.exe'
  $deadline = (Get-Date).AddSeconds(30)
  while ((Test-Path $appExe) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
  if (Test-Path $appExe) { throw 'Executable remains after uninstall' }
  $record = Get-Content $recordPath -Raw | ConvertFrom-Json
  $record.uninstallTested = $true
  $record | Add-Member -NotePropertyName uninstallExitCode -NotePropertyValue $process.ExitCode
  $record | ConvertTo-Json | Set-Content $recordPath
}
