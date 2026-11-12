# VisionForge — Windows verification and remaining release gates

**Owner installation handoff remains held.** Target: Windows 10/11 x64. No finished-release or 100% completion claim.

Successful matrix run: https://github.com/cent247/VisionForge/actions/runs/43139240640  
Tested revision: `d782ad37f58e5dc09dcdef05b0be6b409c3fa857`  
Development PR: https://github.com/cent247/VisionForge/pull/1

## Latest parallel review — Linux and hosted Windows reruns passed

The subsequent security fixes pass `npm run verify` on Linux: 45 automated tests, 13 desktop workflow checks, and the dedicated Electron security regression. The overlay import now checks canonical media containment and exclusive creation; preview caches reject redirected directories and non-regular entries. Production renderer CSP and default permission denial are enabled. This targeted review does not establish a comprehensive security audit or protection from concurrent hostile filesystem races.

The fresh npm audit reports zero known advisories. Verbatim runtime notices for 11 dependency packages are generated, hash checked and included in packaging configuration. The Windows workflow now checks the installed license payload and runs the new security regression. The new installers passed that workflow on both Windows Server 2022 x64 and Windows 11 ARM with the x64 app under emulation: https://github.com/cent247/VisionForge/actions/runs/43146735998 (tested revision 0b86cb36740e511a918eaeb38e7e21f10a4a4de0). Each recorded 44 automated passes, zero failures and one skipped privileged fixture, plus source/packaged/installed editor checks, installed security regressions, 11 packaged license-text hash checks, installation and uninstallation. Evidence: evidence/windows-parallel-review-success.json. The first attempt failed due to checkout line-ending conversion of notices; byte-preserving attributes fixed it, and that failed attempt is not counted as a pass.

A five-minute, 60-cut captioned timeline passed low-resolution full decoding, unchanged-preview reuse and caption-boundary export cancellation/retry. A separate 30-second 1920x1080/24fps six-cut moving-source fixture with audio, captions and effects passed all 720 decoded frames (45.101 seconds including source generation, render and decode). See evidence/reliability-review.md for measured results and exact limits; this does not establish prolonged high-resolution GUI performance or physical power-loss durability.

The installed Windows documentary run has also passed: https://github.com/cent247/VisionForge/actions/runs/43142851730 (tested source dd5419768c63504cea2f87b3a007daf63d6bd36f). It assembled/exported the 160.666667-second film with 22 visual clips and 36 captions; full decoding, 4,820 matching preview/export frames, four narration timing samples within 10ms, -16.6 LUFS and -1.88 dBTP passed. Original narration was imported, not synthesized by that run. This predates the new security changes.

**Release remains held:** the exact complete corresponding-source/dependency/build distribution for the GPL media binaries is incomplete. Clean Windows 10/native Intel/AMD Windows 11 acceptance, devices/human listening, broader reliability/accessibility, comprehensive security and provider/stock work remain open. See evidence/security-review.md and evidence/licensing-review.md. Historical matrix results below apply to their recorded revision; the new rerun above covers the subsequent security and packaging changes.

## Measured Windows coverage

| Environment | Process target | Automated suite | Desktop/source | Packaged app | Installed app | Install/uninstall |
|---|---|---|---|---|---|---|
| Windows Server 2022 Datacenter, build 20348, x64 host | x64, native execution | 43 passed, 0 failed, 1 skipped | 13 passed | 14 passed | 14 passed | Both exit 0; installed executable found and subsequently removed |
| Windows 11 Enterprise, build 26200, ARM64 host | x64 under Windows emulation | 43 passed, 0 failed, 1 skipped | 13 passed | 14 passed | 14 passed | Both exit 0; installed executable found and subsequently removed |

The Windows 11 result is client-OS compatibility coverage under emulation. **It is not a native Intel/AMD Windows 11 result, a Windows 10 result, or a pristine owner-PC/device test.** Setup Node explicitly selects x64 and the installer build targets x64. Actual OS/host architecture is recorded separately in windows-platform.json and installer records.

Each desktop workflow performs real import/metadata, preview playback, audio-tail seeking, MP4 export (105 matching decoded preview/export frames), trim/undo, text/keyframe edits, save/reopen, invalid/missing-media relinking and autosave/damaged-project recovery. Each app form completes 20 play/pause/seek cycles: 60 cycles per OS, 120 across this matrix. File-picker choices are fixture supplied. No physical speaker/audio-device quality claim is made. The one skipped test on each OS is a privileged single-file symlink fixture; directory-junction containment and blocked-upload fixtures run and pass.

## Packaged runtime isolation

For unpacked and installed app launches, the harness removes inherited Node/Python configuration, development PATH entries, renderer URL and source tool/font overrides. The app's child PATH is exactly `C:\Windows\System32;C:\Windows` in both recorded runs. The main process reports packaged execution and points to FFmpeg/FFprobe and fonts inside its own resources folder; file existence and containment are asserted before the import/preview/export workflow runs.

The parent test driver still uses development tools to generate fixtures and automate the app. Other software remains installed on the hosted OS image. This check proves operation with restricted executable lookup and bundled media components; it does not establish absence of every possible system dependency on a clean client PC.

## Exact evidence

Evidence is retained in `evidence/github-windows/client-matrix/server-2022-x64/` and `evidence/github-windows/client-matrix/windows-11-arm-x64-emulated/`: actual platform JSON, separate source/packaged/installed desktop JSON (including packagedRuntime), unit-test output, dependency audit and installer records. Successful job logs and matrix job metadata accompany them. ZIP evidence entries were extracted with CRC validation; the full artifact archives were not independently downloaded/hashed here.

| Internal candidate build | Windows-recorded installer SHA256 | GitHub artifact |
|---|---|---|
| Server 2022 x64 | b7993ce012a77e91d3f545643f767682cced22a5866c9692df60dc2819213ab8 | 13908423398 |
| Windows 11 ARM host, x64 target | d75079cc4fd8eb8ad0c88d6394d46ea82523eaab07aa99a18f2adf1117f06be2 | 13909655839 |

Both installers are unsigned internal candidates. They have the same target architecture; build artifact hashes differ and are tracked separately. Neither is presented as an owner-ready release.

Both Windows dependency audits report zero known npm advisories. Existing Linux source verification reports 44 passed tests and 13 desktop checks; the latest test-harness regression also passes (evidence/isolated-runtime-linux-regression.txt). Zero known advisories is not a complete security audit.

## Existing documentary

NIGHT SIDE was assembled, saved/reopened, previewed and exported through VisionForge on Linux: 160.666667 seconds, original script/neural narration/music, NASA footage and B-roll, two timeline audio layers, captions, motion/fades, titles and credits. Records include full decoding, 4820 matching preview/export frames and sampled narration alignment within 10ms. Source/license metadata and validation remain in production/night-side. The original matrix exports short test projects; the subsequent documentary workflow described above covers the complete Windows film. Full human auditory review remains open.

## Remaining gates

- Clean Windows 10 x64 and native Intel/AMD Windows 11 client acceptance, physical audio/display/device and native interactive-dialog checks, and privileged path/reparse-point coverage. Supplier minimum Windows 10 22H2; earlier versions are not covered.
- Final GPL corresponding-source/build-dependency redistribution review, complete license notices and comprehensive security review.
- Broader long-project/preview-performance/memory, physical full-disk/power-loss, malformed-media, usability/accessibility and live-provider acceptance. Preview requires rendered preparation, some editing controls remain basic, and remote stock search is not implemented.
- Final accepted installer and installation/user-guide validation. No owner dependency installation, troubleshooting or interim testing is requested.

Earlier failed setup, API-rate-limit and seek attempts remain recorded. They are not passes. The old failed run's packaged JSON copied from source is invalid as packaged evidence. Current source/packaged/installed results are captured separately.
