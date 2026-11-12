# Third-party inventory and release obligations

## Application packages and bundled runtime

DEPENDENCIES.json records the development/install inventory; package-lock.json records resolved versions. `node scripts/collect-runtime-licenses.cjs` copies verbatim license/notice files for all 11 non-development lockfile packages into resources/legal and records their versions, installed paths and SHA256 hashes. `--check` verifies the generated files against installed originals. This conservative set includes type-only packages even when not retained by bundling. electron-builder includes resources/legal in the installed application.

React 18.3.1, React DOM 18.3.1, Scheduler 0.23.2, Zustand 5.1.0, Zod 4.6.7, loose-envify 1.4.0 and js-tokens 4.0.0 declare MIT licenses. Lucide React 0.468.0 declares ISC. The copied files retain their upstream copyright/permission text. Electron's LICENSE.electron.txt and LICENSES.chromium.html remain beside the packaged executable; the package includes separate Chromium/Electron notices. This inventory does not replace review of the final installer payload.

DejaVu Sans and its Bitstream Vera/font notices are supplied in resources/fonts. The app icon is an original geometric asset.

## Separate media executables — unresolved release gate

resources/tools/win-x64/MANIFEST.json records exact archive and FFmpeg/FFprobe executable hashes. LICENSE.txt is GPLv3. The executable configuration contains `--enable-gpl --enable-version3`; this is not an LGPL-only distribution. resources/tools/win-x64/REDISTRIBUTION-STATUS.md and evidence/licensing-ffmpeg-static.json identify the missing exact corresponding-source, dependency and build-recipe retention/delivery work. The supplier's MIT build scripts do not relicense the generated binaries. Public release remains held until this gate is resolved.

## Documentary assets

NIGHT SIDE uses NASA footage with recorded sources, credits and hashes in production/night-side. NASA media guidelines, third-party exceptions and no-endorsement conditions still apply. Original script/music and rendered Kokoro narration accompany the project; neural model weights are not bundled application dependencies. Inference/model licenses and provenance belong with their source workflow; rendered audio does not require Python or model installation to reopen the project.

## Verification limits

The retained dependency-remediation audit reports zero known npm advisories (evidence/dependency-remediation-audit.json); this corrects the older six-moderate-advisory statement and is not a fresh audit or comprehensive security assessment. Hosted Windows runtime and documentary passes are recorded separately. No completed legal review, zero-vulnerability claim, or owner-ready release is asserted.
