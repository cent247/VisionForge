# Preview seek regression

Intermittent Windows seek failures remain recorded. Run 43132651605 passed source and unpacked desktop checks but the installed copy failed a repeated seek; it is not a full acceptance pass. Artifact 13904994940 shows a paused, fully buffered 3.5s movie and input/video at 0.388565s after an expected 2.8s seek. The earlier layout-timing change alone failed and is not counted as a repair.

User seek intent is separate from playback ticks. The numeric input now retains an editing draft while focused, so clock feedback cannot rewrite it during editing. Diagnostics record requested seek and revision as well as actual time and input value. The desktop regression now performs 20 play/pause/seek cycles in each source, unpacked and installed run. Linux TypeScript/build, 44 tests and all 13 desktop checks pass; the standalone 20-cycle execution also passes (evidence/seek-20-cycles.txt). Hosted Windows verification of this newest change is pending.
