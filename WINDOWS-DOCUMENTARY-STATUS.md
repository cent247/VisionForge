# Windows documentary reproduction — passed; release acceptance remains open

Successful run: https://github.com/cent247/VisionForge/actions/runs/43142851730
Tested revision: dd5419768c63504cea2f87b3a007daf63d6bd36f

The installed Windows Server 2022 x64 application freshly imported and assembled NIGHT SIDE, saved/reopened its project, rendered and played preview, and exported the final movie using bundled FFmpeg/FFprobe and fonts. Its child executable search path was restricted to Windows directories.

The film is 160.666667 seconds, with 22 visual clips, 36 captions, imported original Kokoro narration, music, titles and effects. Narration was reused, not synthesized in this Windows run. Caption timing follows measured synthesis utterance bounds, not ASR.

Validation passed full decoding, all 4,820 matching decoded preview/export frames, one subtitle stream, and four sampled narration windows within 10ms. Integrated loudness was -16.6 LUFS and true peak -1.88 dBTP. Sampled timing does not establish exhaustive listening quality.

Evidence is retained in evidence/github-windows/documentary-success. Source/credit/provenance records accompany the project recipe.

This closes the hosted Windows documentary reproduction gate only. Clean Windows 10 and native Intel/AMD Windows 11 acceptance, physical device/audio and human listening review, licensing/security review, broader reliability/performance and accessibility/usability, live providers/remote stock, and final accepted installer/documentation remain open. The installer is not an owner-ready release.
