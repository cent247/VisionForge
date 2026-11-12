# Windows documentary reproduction — prepared, not passed

A dedicated Windows Server 2022 x64 workflow will freshly import and assemble NIGHT SIDE through the installed Windows editor's UI, save/reopen, render/play preview, and export the >=120s MP4. The existing original Kokoro narration is reused as an imported asset; new speech generation or recognition is not claimed. NASA footage is downloaded with the source archive's recorded byte counts/SHA256s. Original music is generated as a source asset, then mixed by the app. Caption timing is measured synthesis timing, not ASR.

Only source preparation and output validation happen outside the application. Final scene assembly, captions/effects, preview and MP4 export use the actual installed editor. The app child PATH remains restricted to Windows directories through the existing harness. A successful movie run must pass full decoding, preview/export frame agreement, sampled narration alignment, loudness and caption-stream checks, and pack its actual saved project/media. No Windows movie result is claimed before the workflow completes.

Narration SHA256: 843ff21cb6bf2ca6d0b4366dfdf7f56b48786dc474515d7d2b42bbe504c70a72. This is the original recording from the documented Linux application speech-service workflow, shared with the project's original educational script. Source/credit/license records accompany the recipe. The app release remains held for the other acceptance gates.

Execution requested for the pinned Windows documentary recipe; result remains pending until the workflow passes.
