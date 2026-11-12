# Additional reliability acceptance

Run `node tests/reliability-acceptance.mjs` after `npm run test:compile`. This is opt-in and is not added to the routine unit suite.

The Linux render API passed a real five-minute timeline with 60 image cuts, one continuous audio clip and 60 captions at 320x180, 12fps. Preview preparation plus full decoding took 16.544 seconds; output duration was 300 seconds with 3,600 frames, audio and one subtitle stream. An unchanged preview cache hit took 6ms without renderer progress events.

A supplementary 30-second 1920x1080/24fps preview also passed: six moving-test-pattern video cuts, motion and brightness effects, one continuous audio clip, six captions and 720 fully decoded frames. Source generation, two-pass preview rendering and full decoding together took 45.101 seconds. The render was capped by a 60-second abort budget. These generated fixtures establish bounded HD rendering, not real-camera codec diversity or a hardware benchmark.

Cancellation at the transition into the caption-rendering pass preserved an existing completed-output sentinel, removed render/staging files and allowed a subsequent 10-second export to succeed. The preexisting media suite separately covers cancellation during an in-flight timeline render. The new boundary test does not establish interruption midway through caption encoding or an uncatchable process kill.

Sampled Node RSS peaked at 44.9MiB. FFmpeg memory was not measurable through this sandbox's missing `/proc/.../children` interface; this figure excludes the rendering subprocess and is not an overall application-memory bound.

Machine-readable results and execution output: `reliability-acceptance.json` and `reliability-acceptance.log`. An initial harness assertion incorrectly counted the legitimate preview cache folder as a partial-output folder; it was corrected before the passing run. No production defect was found by these checks and no production source was changed.

The passing rerun used compiled preview code containing the new preview-cache redirection guard. These results add duration/cut-count, bounded 1080p and cancellation/retry coverage. They do not complete broad high-resolution/large-media performance, extended interactive playback, memory-leak testing, Windows/device behavior, disk-full/power-loss, or complete interrupted-application acceptance. The fixture uses a repeated generated image and tone, not 60 independent camera files.
