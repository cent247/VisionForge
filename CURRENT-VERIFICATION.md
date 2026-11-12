# Current revision — verification in progress

Local source passes TypeScript/build, 44 tests (0 failures/skips) and 13 Electron desktop checks, including repeated play/pause/seek. npm audit reports zero known advisories after exact-version build dependency overrides.

Media-folder canonical-root checks protect preview, export, streaming and caption-provider upload; import/relink already had this protection. New directory symlink/Windows junction tests verify rejection. The caption fixture confirms zero outbound requests when the media folder redirects outside the project.

Hosted Windows Server 2022 run 43131467249 passed source/packaged/installed desktop, NSIS build/install/uninstall with dependency overrides and the rendering path fix. It predates the latest preview-seek change and caption-upload guard. The current revision requires a fresh Windows run before acceptance. Windows 10/11 client hardware and other release gates remain open.
