# Preview seek correction

A Windows source/packaged seek intermittently returned to the previous playback clock. Diagnostics from run 43132146364 show requested seek completion timed out with UI/video both at 0.288603s, paused and fully buffered, despite a 3.5s movie. Changing effect timing alone did not fix it.

Explicit user seek requests are now stored separately from media timeupdate feedback. The preview only seeks when that request changes (or a new preview loads); playback ticks update the displayed clock without issuing another seek. Decode errors are reported. The five-cycle play/pause/seek regression, other 12 desktop checks, TypeScript/build and 44 Linux tests pass in evidence/explicit-seek-verification.txt. Hosted Windows verification of this revision is pending.

The media downloader now uses the recorded archive URL/SHA256/size plus individual executable hashes directly. A real download/extraction/hash check passes locally (evidence/pinned-tool-check.json). Supplier metadata API rate limits caused another failed attempt; no account token is needed or used. Changed supplier bytes fail validation instead of silently refreshing tools.
