# VisionForge workflow guide

Installation is held pending release acceptance. These steps describe implemented workflows, not a request to install an intermediate build.

1. Create a project and import video/images/audio. Files are copied into the project media folder after validation. Save/Open preserve timeline, captions and script/storyboard drafts; newer autosave recovery is offered. Relink validates replacements against existing clip bounds before publication. Damaged saved documents can offer a validated autosave; explicitly save after recovery.
2. Add tracks/clips. Drag clips between compatible tracks; snapping, zoom, splitting, ripple deletion and undo/redo are available. Drag the edge handles inward to trim, or use numeric controls. Source video sound is included unless muted. Use gain, fades, speed, crop/color/position controls, capture keyframes and edit/delete their values.
3. Add text overlays, set font size/background, load selected text and update it. Import/edit SRT captions and apply. Caption styling and output width/height/fps are under Project/export settings. Optional master loudness is disabled by default.
4. The offline storyboard helper uses rules and filename matching. Review proposed scene JSON before applying; application validates source bounds and can be undone. Optional compatible AI/speech/timed-SRT endpoints send script/audio only on explicit action. Remote services may charge; keys are not saved. Generated speech imports as media; captions require review and timeline-offset adjustment before applying. Models are not bundled in the owner application.
5. Use Update preview after edits or Play to prepare a rendered movie. This uses the same timeline compositor as export and may take time. Once ready, one media clock controls sound/picture and seeking. Edits invalidate the preview. Preparation can be cancelled.
6. Save/reopen and review before Export MP4. Completed export publication is atomic. Export rejects destinations that would overwrite the project, its autosave or imported project media. Cancel leaves an existing completed output intact. Render progress is reported; captions are burned and included as a selectable subtitle track when present.
7. Shortcuts outside text inputs: Space play/pause, arrow keys one-frame seek, Ctrl/Cmd-S save, Ctrl/Cmd-Z undo, Ctrl/Cmd-Shift-Z redo, Delete remove selected clip.

See KNOWN-ISSUES.md and AUDIT-AND-TEST-REPORT.md for limitations and evidence. No professional-editor parity or100% completion claim.
