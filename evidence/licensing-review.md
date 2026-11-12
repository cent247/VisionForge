# Focused licensing review

## Completed changes and checks

- Added a reproducible collector for installed non-development lockfile dependency license texts. It copies originals byte-for-byte, records package versions and SHA256 hashes, and fails if a package has no license text.
- Generated 11-package notices (13 files including manifest and readme); `node scripts/collect-runtime-licenses.cjs --check` passed against installed originals.
- Added resources/legal -> legal to extraResources. Parsed packaging YAML and asserted mapping. Existing candidates predate this addition; a rebuild and inspection must verify the final installer includes these files.
- Corrected stale advisory/runtime statements in third-party notices. Retained audit reports zero known npm advisories; no fresh audit is claimed here.
- Retained exact static FFmpeg version/configuration and hash evidence. The GPLv3 supplier license agrees with embedded --enable-gpl/--enable-version3 flags. Native invocation was not used for this inspection.

## Blocking findings

The source package does not yet provide a retained complete corresponding-source distribution for the bundled GPL media executables and all included dependencies. Embedded short FFmpeg revision/configuration helps identify it but does not close the gap. The `latest` archive URL floats; supplier daily retention is limited. Do not equate archived executable hashes, build-script repository links or a GPL text with corresponding-source fulfillment. Exact full revisions, dependency sources, patches, build scripts and durable source delivery must be assembled before public distribution.

The final installer must be rebuilt and checked for the newly generated notices, Electron/Chromium notices, font notices and media-tool notices. Documentary source/license provenance remains in its production pack; no exhaustive rights clearance was performed. No legal approval is claimed.

## Primary references consulted

- https://ffmpeg.org/legal.html — distinguishes optional GPL components and exact source/build disclosure in its compliance discussion.
- https://github.com/FFmpeg/FFmpeg/blob/master/LICENSE.md — FFmpeg license conditions, including version3 configurations.
- https://github.com/FFmpeg-Builds/FFmpeg-Builds — dependency scripts and floating latest/daily retention policy; minimum Windows support.

The changes preserve upstream license text rather than paraphrasing it. The application's own licensing/distribution decision is not inferred from process separation alone.
