# Current VisionForge verification

**Owner installation handoff remains held.** No finished-release or 100% completion claim.

Successful hosted run: https://github.com/cent247/VisionForge/actions/runs/43133506625  
Tested source/dependency commit: `67a90f1045c782054f82e995220befa06dbc76de`  
Development PR: https://github.com/cent247/VisionForge/pull/1

## Recorded checks

| Check | Result | Evidence |
|---|---|---|
| Linux TypeScript/build and automated tests | 44 passed, 0 failed/skipped | evidence/seek-input-verification.txt |
| Linux desktop workflow | 13 checks passed; standalone 20-cycle seek check also passed | evidence/seek-20-cycles.txt |
| Hosted Windows Server 2022 TypeScript/build | Passed | latest successful run log |
| Hosted Windows automated suite | 43 passed, 0 failed, 1 skipped; 44 total | evidence/github-windows/latest/windows-unit-tests.txt |
| Source Electron desktop workflow | 13 checks passed, including 20 play/pause/seek cycles | latest/windows-source-desktop.json |
| Native NSIS installer build | Passed | latest successful run log |
| Unpacked packaged app desktop workflow | 13 checks passed, including 20 seek cycles | latest/windows-packaged-desktop.json |
| Silent installation | Exit 0; installed executable found | latest/windows-installer.json |
| Installed app desktop workflow | 13 checks passed, including 20 seek cycles | latest/windows-installed-desktop.json |
| Silent uninstallation | Exit 0; executable removed | latest/windows-installer.json |
| npm dependency audit | Zero known advisories, on Linux and Windows | dependency-remediation-audit.json; latest/windows-dependency-audit.json |

Paths abbreviated `latest/` above are under `evidence/github-windows/`. The Windows single-file symlink fixture remains skipped because its privilege setup is not provisioned. New directory-junction boundary fixtures run on Windows and pass. A dependency audit is not a comprehensive security audit.

Each desktop workflow uses actual Electron UI, preload/main IPC, project files, real media inspection, preview playback and MP4 export. It checks delayed/embedded audio and audio-tail seeking, 105 matching decoded preview/export frames, trims/undo, keyframe/text edits, save/reopen, invalid and missing-media relinking, newer-autosave and damaged-project recovery. File-picker choices are supplied by fixtures. No physical speaker/device quality claim is made. Across the three Windows app forms this is 39 passed step executions and 60 deliberate seek cycles.

Installer: `VisionForge-INTERNAL-CANDIDATE-Setup-0.1.0-x64.exe`  
Windows-recorded SHA256: `9f475ed0008adbdf482728a2475e800884e74cc68f9168fae28379f04d22040a`  
GitHub artifact: `13905554727`; recorded archive digest `d1bc14c0318fa186fa9fcb1b1690b2571d37f82649d85a19628a24d383936995`. Latest evidence entries were extracted and ZIP CRC checked; this last archive was not fully downloaded and independently hashed here. The installer remains an unsigned internal candidate.

## Repairs this stage

- Patched the two affected minimatch versions in packaging dependencies to 11.0.1; preserved older dependency APIs and regenerated the installed package inventory.
- Applied canonical media-folder containment to preview, export, streaming and caption uploads. The upload fixture verifies zero outbound requests when a folder redirects outside the project.
- Separated explicit seek requests from playback-clock feedback. The focused numeric input now preserves an editing draft. Earlier timing-only changes did not resolve the intermittent failure; failed runs and diagnostics remain recorded. The final revision passed all three Windows app forms with the stronger 20-cycle regression.
- Replaced supplier metadata API lookups with recorded archive/size/SHA256 and executable hashes. Real download/hash verification passes on Linux and Windows. A supplier byte change fails validation rather than silently refreshing tools.

Previous runs include metadata API rate limiting, setup/packaging command failures, and intermittent source/packaged/installed seek failures. They remain failed attempts, not passes. An old failed run's packaged JSON was copied from source evidence; it is explicitly invalid as packaged evidence. Latest stage evidence is separately cleared and captured.

## Genuine documentary

The existing NIGHT SIDE film was assembled, saved/reopened, previewed and exported through VisionForge on Linux: 160.666667 seconds, original script and neural narration, NASA footage/B-roll, original music, two timeline audio layers, captions, motion/fades, titles and credits. Recorded validation includes full decode, 4820 equal preview/export frames and sampled narration timing within 10ms. Script, source/license metadata and validation are in production/night-side. It was not regenerated in the Windows workflow, and full human auditory review remains open.

## Remaining release gates

- Clean Windows 10/11 client-edition installation/runtime and hardware audio/display checks, native interactive dialogs and privileged file/reparse-point coverage. Windows Server 2022 is a separate tested target. Supplier minimum is Windows 10 22H2; older Windows 10 is not covered.
- Final GPL corresponding-source/build-dependency redistribution review and complete security/license notices review. Zero reported npm advisories does not close these gates.
- Broader long-project/preview-performance/memory, physical full-disk/power-loss, malformed-media, usability/accessibility and live external-provider acceptance. Preview requires rendered preparation; editing controls remain basic in several areas. Remote stock search is not implemented.
- Final installer and installation guide validation against an accepted target-platform release. The owner is not asked to install dependencies or test interim builds.
