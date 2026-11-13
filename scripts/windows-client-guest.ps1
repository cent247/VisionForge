$ErrorActionPreference = 'Stop'
$config = Get-Content (Join-Path $PSScriptRoot 'guest-config.json') -Raw | ConvertFrom-Json
$root = 'C:\VisionForgeClientAcceptance'
New-Item -ItemType Directory -Force $root | Out-Null
Set-Location $root
function Report([string]$stage, $details) {
    $body = @{ stage=$stage; details=$details; utc=(Get-Date).ToUniversalTime().ToString('o') } | ConvertTo-Json -Depth 30 -Compress
    Invoke-RestMethod -Uri ($config.baseUrl + '/report') -Method Post -Headers @{Authorization=('Bearer ' + $config.reportToken)} -ContentType 'application/json' -Body $body | Out-Null
}
$record = @{ passed=$false; environment='Windows x64 evaluation virtual machine'; tests=@() }
Start-Transcript -Path (Join-Path $root 'guest-transcript.txt') -Force | Out-Null
try {
    Start-Sleep -Seconds 20
    $os = Get-CimInstance Win32_OperatingSystem
    $tpm = Get-Tpm
    $tpmSpec = (Get-CimInstance -Namespace 'root/cimv2/security/microsofttpm' -ClassName Win32_Tpm).SpecVersion
    $secureBoot = Confirm-SecureBootUEFI
    $record.platform = @{caption=$os.Caption; version=$os.Version; build=$os.BuildNumber; architecture=$os.OSArchitecture; processorArchitecture=$env:PROCESSOR_ARCHITECTURE; secureBoot=$secureBoot; tpmPresent=$tpm.TpmPresent; tpmSpec=$tpmSpec}
    if ($config.targetBuild -and $os.BuildNumber -ne $config.targetBuild) { throw "Unexpected client OS build: $($os.BuildNumber)" }
    if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64') { throw 'Guest must be x64 Windows' }
    if (!$secureBoot -or !$tpm.TpmPresent -or $tpmSpec -notmatch '2\.0') { throw 'Secure Boot and TPM2 guest verification failed' }
    $record.evaluation = @(Get-CimInstance SoftwareLicensingProduct | Where-Object { $_.Name -like 'Windows*' -and $_.Description -like '*TIMEBASED_EVAL*' } | Select-Object Name,Description,LicenseStatus,GracePeriodRemaining)
    Report 'guest-ready' $record
    Invoke-WebRequest -UseBasicParsing ($config.baseUrl + '/harness.zip') -OutFile harness.zip
    Expand-Archive harness.zip -DestinationPath $root -Force
    Invoke-WebRequest -UseBasicParsing ($config.baseUrl + '/node.zip') -OutFile node.zip
    if ((Get-FileHash node.zip -Algorithm SHA256).Hash.ToLower() -ne $config.nodeSha256) { throw 'Node runtime hash mismatch' }
    Expand-Archive node.zip -DestinationPath $root -Force
    $node = (Get-ChildItem $root -Filter node.exe -Recurse | Select-Object -First 1).FullName
    if (!$node) { throw 'Node runtime missing' }
    Invoke-WebRequest -UseBasicParsing ($config.baseUrl + '/installer.exe') -OutFile installer.exe
    if ((Get-FileHash installer.exe -Algorithm SHA256).Hash.ToLower() -ne $config.installerSha256) { throw 'Installer hash mismatch' }
    $install = 'C:\VisionForgeClientApp'
    $process = Start-Process (Join-Path $root 'installer.exe') -ArgumentList @('/S',"/D=$install") -PassThru -Wait
    if ($process.ExitCode -ne 0) { throw "Installer exit $($process.ExitCode)" }
    $exe = Join-Path $install 'VisionForge.exe'
    if (!(Test-Path $exe)) { throw 'Installed executable missing' }
    $record.installer = @{sha256=$config.installerSha256; exitCode=$process.ExitCode; executableFound=$true}
    $env:VF_TEST_EXECUTABLE = $exe
    $env:VISIONFORGE_TOOLS = Join-Path $install 'resources\tools\win-x64'
    $env:VISIONFORGE_FONTS = Join-Path $install 'resources\fonts'
    $env:Path = $env:VISIONFORGE_TOOLS + ';' + $env:Path
    New-Item -ItemType Directory -Force evidence | Out-Null
    foreach ($test in @('parity-desktop.cjs','security-desktop.cjs','keyboard-desktop.cjs','stock-desktop.cjs')) {
        Report ('starting-' + $test) $record.platform
        $previousPreference = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        $output = & $node (Join-Path 'tests' $test) 2>&1
        $exit = $LASTEXITCODE
        $ErrorActionPreference = $previousPreference
        $output | Out-File (Join-Path 'evidence' ($test + '.log')) -Encoding utf8
        if ($exit -ne 0) { throw "Guest test $test exited $exit`n$($output -join "`n")" }
        $record.tests += @{name=$test;passed=$true}
        Report ('passed-' + $test) $record.tests
    }
    & $node scripts/check-packaged-licenses.cjs (Join-Path $install 'resources\legal')
    if ($LASTEXITCODE -ne 0) { throw 'Packaged license check failed' }
    $uninstaller = (Get-ChildItem $install -Filter '*uninstall*.exe' | Select-Object -First 1).FullName
    $removed = Start-Process $uninstaller -ArgumentList '/S' -PassThru -Wait
    $deadline = (Get-Date).AddSeconds(45)
    while ((Test-Path $exe) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
    if ($removed.ExitCode -ne 0 -or (Test-Path $exe)) { throw 'Uninstall verification failed' }
    $record.uninstall = @{exitCode=$removed.ExitCode;executableRemoved=$true}
    $record.passed = $true
} catch {
    $record.error = ($_ | Out-String)
} finally {
    Stop-Transcript | Out-Null
    $record.evidence = @{}
    if (Test-Path evidence) { Get-ChildItem evidence -File | Where-Object {$_.Extension -in @('.json','.log')} | ForEach-Object { $record.evidence[$_.Name] = Get-Content $_.FullName -Raw } }
    $record.transcript = Get-Content (Join-Path $root 'guest-transcript.txt') -Raw
    Report 'complete' $record
}
shutdown.exe /s /t 10
