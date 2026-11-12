# Current report

See CURRENT-VERIFICATION.md for the successful current Windows run, 44 Linux tests, 43 passed/1 skipped Windows tests, 39 desktop step executions, install/uninstall results, zero npm advisories and remaining release gates. The following material is retained historical audit context; its earlier status statements are superseded.

# Latest Windows update

Hosted Windows Server 2022 source, packaged and installed desktop workflows, native installer build, silent install and uninstall now pass. Automated suite: 41 passed, 0 failed, 1 skipped. See GITHUB-TESTING-STATUS.md and evidence/github-windows for current evidence and remaining limits. This supersedes Windows-environment statements in the historical Linux-stage report below. Windows 10/11 client hardware acceptance is still open.

# VisionForge — current verification report

**Release status: NOT accepted for owner installation. No100% completion claim.** This report supersedes older32/38-test status summaries. The removed GitHub plugin is not used, and this route requires no account sign-in or owner-PC testing.

## Latest media-import repair

Audio streams with attached cover artwork are now correctly imported as audio, without misleading video dimensions. A generated MP3 with a real attached JPEG verifies classification and duration. Full TypeScript, build,42 automated tests and Electron desktop workflow passed; see evidence/alternative-testing/verification-media.txt. The existing Windows candidates predate this production change and are not the current source build. Native Windows execution remains untested.

## Result of the alternative route

The current source compiles, passes42 Linux automated tests, passes the real Electron desktop workflow, and cross-builds both an NSIS installer candidate and a portable Windows candidate. The previously failing Wine uninstaller-generation step is replaced with the build dependency's own static UninstallerReader. This extracts the generated uninstaller; it does not execute it or simulate a Windows pass. The build script is pinned to the installed electron-builder26.18.0 dependency.

Current candidate packages include matched, archive-hash-verified FFmpeg/FFprobe9.0-branch AMD64 binaries, the caption font/license, app icon/version resources and the compiled application. They are unsigned internal candidates. They have **not** been installed or run on Windows.

## Modules and implemented behavior

Electron main/preload IPC; React/TypeScript editor/history; shared project/timeline/animation/SRT validation; transactional import and validated relink; bounded media inspection; one layered render engine for preview/export; cache invalidation and byte-range seeking; staged output/cancellation; optional explicit chat/speech/timed-SRT services. JSON project documents remain authoritative. Main-frame IPC, path checks, context isolation and disabled renderer Node integration are present, but a comprehensive security review is incomplete.

Multiple video/audio/overlay tracks support movement/snapping, numeric/inward-handle trimming, splitting/ripple deletion, zoom/navigation, undo/redo, source audio/mute, gain/fades/speed, crop/color/position effects, motion, basic position/volume keyframes, editable text, styled captions, script drafts and project settings/loudness. Preview is a rendered movie and requires preparation after edits; it is not instant real-time editing. Optional services may charge and require explicit action; credentials are not saved. Offline planning uses rules/filename matching. Remote stock search is not implemented.

## Current evidence

| Check | Status | Evidence |
|---|---|---|
| TypeScript/build and existing desktop verification | Passed | evidence/alternative-testing/verification-final.txt |
| Automated unit/media/service tests |42 passed;0 failed/skipped on Linux | evidence/alternative-testing/verification-media.txt |
| Delayed/embedded audio, tails, audio-only output and preview/export frame agreement | Passed measured fixtures | tests/preview-render.test.mjs |
| Captions in a quoted/spaced folder;2x speed preserving pitch | Passed real media fixtures | same media suite |
| Save serialization and unchanged-file handling after validation failure | Passed | tests/project-storage.test.mjs |
| Forced process termination during saving | Passed; completed document remains readable and subsequent save works | same storage suite |
| Disk-full write failure | Passed **injected ENOSPC**, not a physical full-disk/power-loss test | same storage suite |
| Damaged saved document recovery; autosave identity/content checks | Passed | same storage suite |
| Too-short relink protection and transactional import/relink | Passed | tests/media-management.test.mjs |
| Export cannot overwrite a project, autosave or imported media | Passed | tests/preview-render.test.mjs |
| Desktop playback/seek,105 matching export/preview frames, trims, overlay/keyframe edits and undo | Passed actual Electron UI | verification-final.txt; desktop-recovery.json |
| Missing-media relink, newer autosave and damaged-file recovery through UI | Passed | same desktop evidence; alternative-testing/desktop.txt |
| NSIS and portable cross-build | Passed **build only** | alternative-testing/packaging.json and .log |
| Installer/portable extraction/CRC; embedded app/main/preload/resources/tools/font comparison | Passed **static inspection only** | alternative-testing/package-inspection.json and .log |
| Native Windows10/11 install, launch, device audio, playback, export and uninstall | **Untested** | WINDOWS-TEST-STATUS.md |

The current Windows app executable is AMD64; NSIS uses a32-bit bootstrap executable containing the64-bit application. Static inspection verifies both payloads, executable headers, media-tool hashes, bundled font and licenses. The packaged main/preload/renderer match the preceding tested compiled build, before the cover-art import fix. Current source is newer; these candidates have not been rebuilt for that fix. Public test-source files belonging to a dependency are present; first-party test fixtures and environment files are excluded. An initial inspection check wrongly treated dependency test sources as first-party tests; its failed log is retained and the scope was corrected. An earlier artifact-name macro error was fixed and the build rerun successfully. Historical Wine failures remain recorded and are not counted as passes.

Desktop tests supply file-dialog choices through fixtures, while actual UI, preload/main IPC, metadata, disk operations, preview and export run normally. Windows-native dialogs, hardware playback and full human auditory review remain untested. No test result here establishes physical power-loss durability.

## Existing genuine documentary

NIGHT SIDE was assembled, saved/reopened, previewed and exported through the actual Electron application:160.666667 seconds,1280x720/30fps, H.264 video, AAC audio, burned captions plus one mov_text subtitle track. Original script,22 footage/animation clips,36 measured sentence-level captions, real local neural narration, original music, two audio tracks, motion/fades, title and credits. NASA source/credit/hash metadata accompany the saved project. Caption timings are measured synthesized utterance bounds, not ASR word alignment.

The recorded Linux demonstration validation passed full decoding,4820 identical preview/export frames and four sampled narration windows within10ms; loudness measured-16.61LUFS/-1.88dBTP. It predates the latest storage/export-safeguard changes; the render graph is unchanged. It is not a Windows export or an exhaustive long-duration playback test. FFmpeg outside the app generated/converted source audio and validated output; it did not assemble the final movie. The rejected Raindrop film is historical and does not count as acceptance.

## Remaining acceptance gates

- Native Windows10/11 installer/runtime/audio/export/uninstall, plus interrupted-application operations on those platforms. No native Windows test host is connected. GitHub is not required for the new cross-build route, but cross-building does not replace Windows execution.
- Current media-binary supplier documents Windows10 22H2 as its minimum supported Windows version; older Windows10 is not covered by this candidate. Actual target compatibility still needs testing. Provenance hashes are verified; final GPL corresponding-source/build-dependency and redistribution review remains open.
- Last recorded npm audit: six moderate build-tool advisories, zero high/critical. It was not rerun this stage. Final dependency/security review remains required.
- Broader large-project/long-playback/memory/performance, physical disk-full/power-loss, malformed-media, accessibility/usability and security acceptance. Inward trim handles, basic transitions/keyframes and manual provider-caption offset review remain limitations. Live external provider/stock acceptance is incomplete.
- Validate final installer and installation guide against the accepted target-platform package. No unfinished candidate is presented to the owner as a finished release.

## Developer reproduction

`npm run verify` runs standard source/media/desktop checks. `node scripts/build-windows-candidate.cjs` builds internal Windows candidates on Linux without Wine execution. `node scripts/verify-windows-package.cjs` performs static package inspection. These are developer commands, not instructions for the owner to install dependencies or troubleshoot.
