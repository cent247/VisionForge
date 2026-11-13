# VisionForge workflow guide

## Install the Windows test build

Download the test archive while signed into the GitHub account with repository access:
https://github.com/cent247/VisionForge/actions/runs/43476781569/artifacts/14063243024

Extract the ZIP, open `release`, and run `VisionForge-INTERNAL-CANDIDATE-Setup-0.1.2-x64.exe`. This unsigned development build is offered for your trial; final Windows 10/11 x64 acceptance and release review remain open. Do not disable Windows security controls if installation is blocked. The installer SHA256 is recorded in `evidence/windows-installer.json` inside the download.

PowerShell can verify it with `Get-FileHash .\VisionForge-INTERNAL-CANDIDATE-Setup-0.1.2-x64.exe -Algorithm SHA256`.

Editing, local media import, captions, and export do not need an AI subscription. AI model weights are not bundled. Optional hosted AI and Pexels features need their own configured service access. The successful local Kokoro test was a developer service test, not an included Windows speech engine.

Version 0.1.1 repairs non-clickable workspace navigation, attaches New/Open dialogs to the editor window, and shows an actionable error when the desktop connection cannot load. These changes passed installed Windows Server x64 checks; the owner-device freeze has not yet been confirmed resolved. Close the old version before installing.

## Version 0.1.2: playback and editing on long timelines

Save your project and close the old app before installing the replacement test build. Reopen the existing project file; for a project named `test1`, this is normally `test1/project.vforge` inside its project folder.

Place the playhead within the section you want to inspect, then choose **Preview 10 seconds here**. This prepares and plays only that section, preserving its position on the timeline. It stops at the end of the short section. Moving outside that section requires another short preview or a full preview. **Update preview** still renders the entire timeline, so it can take longer. Preparation stages, percentages and errors are displayed above the picture, with cancellation available.

To edit, click a purple video/image clip or an audio clip **on the timeline**, then choose **Clip effects**. Change its numeric controls or use the trim handles; Save retains the edit. Split and Delete require a selected clip. Imported library entries are source assets; their plus buttons add editable clips to the timeline.

Version 0.1.2 also moves large rendering instructions into a temporary file and shortens input paths to address Windows process-command limits. Tests cover a synthetic 118-item timeline and a full 118-cut low-resolution export; they do not establish performance for every real project or confirm the owner's PC is repaired.

## First trial

Use a short copy of your own video. Create a new project in a writable folder, import the video, add it to the timeline, trim it, add a text overlay, and update the preview. Save, close, reopen, then export a short MP4. Check picture, sound, text, duration, and seeking in the exported file. Keep the entire project folder, including `media`, when moving a project. Record the action and exact error if anything fails.

## Editing workflows

1. Create a project and import video/images/audio. Files are copied into the project media folder after validation. Save/Open preserve timeline, captions and script/storyboard drafts; newer autosave recovery is offered. Relink validates replacements against existing clip bounds before publication. Damaged saved documents can offer a validated autosave; explicitly save after recovery.
2. Add tracks/clips. Drag clips between compatible tracks; snapping, zoom, splitting, ripple deletion and undo/redo are available. Drag the edge handles inward to trim, or use numeric controls. Source video sound is included unless muted. Use gain, fades, speed, crop/color/position controls, capture keyframes and edit/delete their values.
3. Add text overlays, set font size/background, load selected text and update it. Import/edit SRT captions and apply. Caption styling and output width/height/fps are under Project/export settings. Optional master loudness is disabled by default.
4. The offline storyboard helper uses rules and filename matching. Review proposed scene JSON before applying; application validates source bounds and can be undone. Optional compatible AI/speech/timed-SRT endpoints send script/audio only on explicit action. Remote services may charge; keys are not saved. Generated speech imports as media; captions require review and timeline-offset adjustment before applying. Models are not bundled in the owner application.
5. Use Update preview after edits or Play to prepare a rendered movie. This uses the same timeline compositor as export and may take time. Once ready, one media clock controls sound/picture and seeking. Edits invalidate the preview. Preparation can be cancelled.
6. Save/reopen and review before Export MP4. Completed export publication is atomic. Export rejects destinations that would overwrite the project, its autosave or imported project media. Cancel leaves an existing completed output intact. Render progress is reported; captions are burned and included as a selectable subtitle track when present.
7. Timeline clips are keyboard focusable. Use Tab to reach a clip and Enter or Space to select it; edit its numeric controls for exact placement/trimming. Space activates a focused button or disclosure control. Outside text inputs and focused activation controls, Space plays/pauses. Arrow keys seek one frame; Ctrl/Cmd-S saves; Ctrl/Cmd-Z undoes; Ctrl/Cmd-Shift-Z redoes; Delete removes the selected clip.
8. Optional stock videos: open Stock videos / Pexels, enter your Pexels API key and search words, then choose Search videos. Only your query and key are sent for the search. Review the linked source, creator and usage terms before choosing Download. Downloaded MP4 footage is inspected and copied into the project; creator/source URL, download time and hash are retained with the media entry. Add the imported clip from the media panel. Keys are held in the current session and excluded from the saved project. Clear API key removes the entered key. Live provider access and API limits depend on your Pexels account; fixture tests do not establish live service acceptance.

See KNOWN-ISSUES.md and AUDIT-AND-TEST-REPORT.md for limitations and evidence. No professional-editor parity or100% completion claim.
