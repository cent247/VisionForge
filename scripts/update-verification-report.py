from pathlib import Path
import json,re
raise SystemExit('Historical stage report generator retired: preserve current media-repair report; regenerate only after current Windows package inspection.')
root=Path(__file__).resolve().parents[1];e=root/'evidence/alternative-testing'
package=json.loads((e/'packaging.json').read_text());inspection=json.loads((e/'package-inspection.json').read_text());assert package.get('buildPassed') and inspection.get('staticInspectionPassed')
log=(e/'tests.txt').read_text();count=int(re.findall(r'ℹ tests (\d+)',log)[-1]);assert count==41 and 'ℹ fail 0' in log
report=f'''# VisionForge — current verification report

**Release status: NOT accepted for owner installation. No100% completion claim.** This report supersedes older32/38-test status summaries. The removed GitHub plugin is not used, and this route requires no account sign-in or owner-PC testing.

## Result of the alternative route

The current source compiles, passes{count} Linux automated tests, passes the real Electron desktop workflow, and cross-builds both an NSIS installer candidate and a portable Windows candidate. The previously failing Wine uninstaller-generation step is replaced with the build dependency's own static UninstallerReader. This extracts the generated uninstaller; it does not execute it or simulate a Windows pass. The build script is pinned to the installed electron-builder26.18.0 dependency.

Current candidate packages include matched, archive-hash-verified FFmpeg/FFprobe9.0-branch AMD64 binaries, the caption font/license, app icon/version resources and the compiled application. They are unsigned internal candidates. They have **not** been installed or run on Windows.

## Modules and implemented behavior

Electron main/preload IPC; React/TypeScript editor/history; shared project/timeline/animation/SRT validation; transactional import and validated relink; bounded media inspection; one layered render engine for preview/export; cache invalidation and byte-range seeking; staged output/cancellation; optional explicit chat/speech/timed-SRT services. JSON project documents remain authoritative. Main-frame IPC, path checks, context isolation and disabled renderer Node integration are present, but a comprehensive security review is incomplete.

Multiple video/audio/overlay tracks support movement/snapping, numeric/inward-handle trimming, splitting/ripple deletion, zoom/navigation, undo/redo, source audio/mute, gain/fades/speed, crop/color/position effects, motion, basic position/volume keyframes, editable text, styled captions, script drafts and project settings/loudness. Preview is a rendered movie and requires preparation after edits; it is not instant real-time editing. Optional services may charge and require explicit action; credentials are not saved. Offline planning uses rules/filename matching. Remote stock search is not implemented.

## Current evidence

| Check | Status | Evidence |
|---|---|---|
| TypeScript/build and existing desktop verification | Passed | evidence/alternative-testing/verification-final.txt |
| Automated unit/media/service tests |{count} passed;0 failed/skipped on Linux | evidence/alternative-testing/tests.txt |
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

The current Windows app executable is AMD64; NSIS uses a32-bit bootstrap executable containing the64-bit application. Static inspection verifies both payloads, executable headers, media-tool hashes, bundled font and licenses. The packaged main/preload/renderer match the tested compiled build. Public test-source files belonging to a dependency are present; first-party test fixtures and environment files are excluded. An initial inspection check wrongly treated dependency test sources as first-party tests; its failed log is retained and the scope was corrected. An earlier artifact-name macro error was fixed and the build rerun successfully. Historical Wine failures remain recorded and are not counted as passes.

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
'''
(root/'AUDIT-AND-TEST-REPORT.md').write_text(report);(root.parents[1]/'VisionForge-Current-Test-Report.md').write_text(report)
(root/'ALTERNATIVE-TESTING-STATUS.md').write_text('# Alternative route verified\n\nGitHub-free local tests and Windows cross-packaging are working. See AUDIT-AND-TEST-REPORT.md for41 current passing tests, package-inspection evidence and the separate, still-untested native Windows acceptance gate.\n')
(root/'WINDOWS-TEST-STATUS.md').write_text('''# Windows status — build/static checks passed; runtime untested

Both NSIS installer and portable candidates now cross-build on Linux without GitHub or executing Wine. Upstream UninstallerReader extracts the intermediate uninstaller. The final executable payloads pass extraction/CRC/header/resource/hash inspection, including matched Windows media binaries and font/licenses. See evidence/alternative-testing.

This is not an install, launch, device-audio, playback, export or uninstall pass on Windows10/11. No native Windows test host is connected and no owner testing is requested. Software-emulated virtual machines are a possible future route, but no licensed Windows guest/test environment has been provisioned or validated here. Do not infer that lack of KVM alone makes software emulation impossible.

The media supplier specifies Windows10 22H2 as its minimum supported Windows version. Older Windows10 is not covered by this candidate. Final native compatibility, dependency/license/source review and acceptance remain required. The candidates are unsigned and marked internal. They are not a finished release.
''')
(root/'KNOWN-ISSUES.md').write_text('''# Known issues — owner installation handoff remains held

- Windows cross-build/static checks now pass, but native Windows10/11 install/runtime/device audio/export/uninstall remains untested.
- The media supplier supports Windows10 22H2 minimum; earlier Windows10 is not covered. Actual compatibility is untested.
- Media archive/executable hashes are verified; final dependency/security/notices/corresponding-source review remains open. Last recorded audit has six moderate build-tool advisories.
- Rendered preview preparation can be slow. Large/long projects, hardware behavior and performance need broader acceptance.
- Forced-save termination and injected ENOSPC pass; physical power-loss/full-disk and broader app/export interruption tests remain incomplete.
- Trim handles trim inward; extension is numeric. Transitions/animation and keyboard/accessibility coverage remain basic.
- Optional external services have fixture coverage and real local neural speech is demonstrated. Remote stock search is not implemented. Provider captions require timeline-offset review.
- Native dialog/device tests and full human auditory review remain open. No professional-product parity or100% completion claim.
''')
(root/'DEVELOPMENT-CHECKLIST.md').write_text('''# Development checklist

- [x] Audit/recover saved source and preserve checkpoints
- [x] Unify preview/export and test audio/timing/edit continuity
- [x] Implement/test editing, settings, optional services and improved save/recovery/relink safeguards
- [x] Pass41 current automated tests and real Electron desktop checks
- [x] Export/validate genuine >=120s documentary through application
- [x] Cross-build Windows NSIS/portable candidates without GitHub/Wine execution
- [x] Inspect candidate extraction/CRC/architecture/app resources/tools/fonts
- [ ] Native Windows10/11 install/runtime/playback/audio/export/uninstall acceptance
- [ ] Complete licensing/corresponding-source/dependency and security review
- [ ] Complete broader performance/reliability/usability/live-provider acceptance
- [ ] Validate final package and guide; deliver only after acceptance passes
''')
p=root/'THIRD-PARTY-NOTICES.md';s=p.read_text();a=s.index('The historical Windows');b=s.index('\n\nProduction',a);s=s[:a]+'''The Windows media candidates have been replaced with a matched FFmpeg/FFprobe9.0-branch build from the upstream FFmpeg-Builds release. resources/tools/win-x64/MANIFEST.json records asset/archive/executable hashes and sizes; GPL text is included. Static archive/header/package checks pass. Native execution and final corresponding-source/dependency redistribution review remain open. The supplier documents Windows10 22H2 as minimum supported. DejaVu Sans/font license are included; the app icon is an original geometric vector/rasterized ICO asset.''' +s[b:];p.write_text(s)
p=root/'USER-GUIDE.md';s=p.read_text().replace('Relink validates replacements before publication.','Relink validates replacements against existing clip bounds before publication. Damaged saved documents can offer a validated autosave; explicitly save after recovery.').replace('Completed export publication is atomic.','Completed export publication is atomic. Export rejects destinations that would overwrite the project, its autosave or imported project media.');p.write_text(s)
(root/'README.md').write_text('# VisionForge — development checkpoint\n\nCurrent verification and remaining gates are in AUDIT-AND-TEST-REPORT.md. GitHub-free Linux tests/cross-packaging work; native Windows acceptance remains untested. No owner dependency installation, troubleshooting or interim installation is requested.\n')
print('Report updated with',count,'passing tests and static package inspection.')
