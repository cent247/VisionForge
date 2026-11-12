# VisionForge — Windows verification and remaining release gates

**Owner installation handoff remains held.** Target: Windows 10/11 x64. No finished-release or 100% completion claim.

Successful matrix run: https://github.com/cent247/VisionForge/actions/runs/43139240640  
Tested revision: `d782ad37f58e5dc09dcdef05b0be6b409c3fa857`  
Development PR: https://github.com/cent247/VisionForge/pull/1

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

NIGHT SIDE was assembled, saved/reopened, previewed and exported through VisionForge on Linux: 160.666667 seconds, original script/neural narration/music, NASA footage and B-roll, two timeline audio layers, captions, motion/fades, titles and credits. Records include full decoding, 4820 matching preview/export frames and sampled narration alignment within 10ms. Source/license metadata and validation remain in production/night-side. This matrix exports short test projects, not a new Windows documentary. Full human auditory review remains open.

## Remaining gates

- Clean Windows 10 x64 and native Intel/AMD Windows 11 client acceptance, physical audio/display/device and native interactive-dialog checks, and privileged path/reparse-point coverage. Supplier minimum Windows 10 22H2; earlier versions are not covered.
- Final GPL corresponding-source/build-dependency redistribution review, complete license notices and comprehensive security review.
- Broader long-project/preview-performance/memory, physical full-disk/power-loss, malformed-media, usability/accessibility and live-provider acceptance. Preview requires rendered preparation, some editing controls remain basic, and remote stock search is not implemented.
- Final accepted installer and installation/user-guide validation. No owner dependency installation, troubleshooting or interim testing is requested.

Earlier failed setup, API-rate-limit and seek attempts remain recorded. They are not passes. The old failed run's packaged JSON copied from source is invalid as packaged evidence. Current source/packaged/installed results are captured separately.
