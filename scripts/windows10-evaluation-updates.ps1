$ErrorActionPreference = 'Stop'
$homeDir = 'C:\VFEvaluationBootstrap'
New-Item -ItemType Directory -Force $homeDir | Out-Null
if ($PSScriptRoot -ne $homeDir) {
    foreach ($name in @('guest-updates.ps1','guest-start.ps1','guest-config.json')) { Copy-Item (Join-Path $PSScriptRoot $name) (Join-Path $homeDir $name) -Force }
}
$config = Get-Content (Join-Path $homeDir 'guest-config.json') -Raw | ConvertFrom-Json
function Report([string]$stage, $details) {
    $body = @{stage=$stage;details=$details;utc=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json -Depth 20 -Compress
    Invoke-RestMethod -Uri ($config.baseUrl + '/report') -Method Post -Headers @{Authorization=('Bearer ' + $config.reportToken)} -ContentType 'application/json' -Body $body | Out-Null
}
$stateFile = Join-Path $homeDir 'update-stage.json'
$stage = 0
if (Test-Path $stateFile) { $stage = [int](Get-Content $stateFile -Raw | ConvertFrom-Json).next }
try {
    if ($stage -lt $config.updates.Count) {
        $update = $config.updates[$stage]
        $package = Join-Path $homeDir $update.file
        Report ('preparing-' + $update.file) @{build=(Get-CimInstance Win32_OperatingSystem).BuildNumber}
        if (!(Test-Path $package)) { Invoke-WebRequest -UseBasicParsing ($config.baseUrl + '/' + $update.file) -OutFile $package }
        if ((Get-FileHash $package -Algorithm SHA256).Hash.ToLower() -ne $update.sha256) { throw 'Microsoft update hash mismatch' }
        $resume = 'powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File C:\VFEvaluationBootstrap\guest-updates.ps1'
        New-Item 'HKCU:\Software\Microsoft\Windows\CurrentVersion\RunOnce' -Force | Out-Null
        New-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\RunOnce' -Name VFClientAcceptance -Value $resume -PropertyType String -Force | Out-Null
        # WUSA performs normal package/catalog applicability and trust validation.
        $process = Start-Process wusa.exe -ArgumentList @($package,'/quiet','/norestart') -PassThru -Wait
        if ($process.ExitCode -notin @(0,3010,2359302)) { throw "Windows update $($update.file) exit $($process.ExitCode)" }
        @{next=($stage+1)} | ConvertTo-Json | Set-Content $stateFile
        Report ('installed-' + $update.file) @{exitCode=$process.ExitCode;reboot=$true}
        Restart-Computer -Force
        exit 0
    }
    if ((Get-CimInstance Win32_OperatingSystem).BuildNumber -ne '19045') { throw '22H2 build19045 was not reached' }
    & (Join-Path $homeDir 'guest-start.ps1')
} catch {
    Report 'complete' @{passed=$false;error=($_ | Out-String);stage='Windows10 official update preparation'}
    exit 1
}
