# Windows media tools — source redistribution gate remains open

FFmpeg and FFprobe are bundled as separate command-line processes. MANIFEST.json records the downloaded archive and executable hashes. LICENSE.txt is the supplier's GPL version 3 text. Static inspection of the hashed FFmpeg executable finds `--enable-gpl --enable-version3`, plus GPL components including libx264 and libx265. Treat this as a GPLv3-enabled build, not an LGPL-only build. Exact version/configuration evidence is in evidence/licensing-ffmpeg-static.json.

The recorded binary version is `n9.0.2-49-gc179411bbb-20261111`. The manifest's `latest` URL is mutable. It identifies the original download location but is not durable corresponding-source delivery. The supplier states that latest floats and daily artifacts have limited retention.

Before public distribution, retain and provide the exact corresponding FFmpeg and included dependency source, patches, build configuration/scripts and applicable notices matching these binaries. Verify full source revisions and a durable delivery route. A repository homepage, the supplier's build-script MIT license, and this GPL text alone do not complete those obligations. No promise of a source offer is made without provisioning the promised source.

Hosted Windows execution has passed as recorded in CURRENT-VERIFICATION.md and documentary workflow evidence. Execution tests and hashes do not establish licensing compliance. Owner installation handoff remains held for this gate and the other release gates.

Primary references: https://ffmpeg.org/legal.html ; https://github.com/FFmpeg/FFmpeg/blob/master/LICENSE.md ; https://github.com/FFmpeg-Builds/FFmpeg-Builds .
