# Known issues — test build

- The owner reported an apparently inert 0.1.0 installation. Version 0.1.1 fixes confirmed decorative sidebar entries, gives New/Open dialogs an owner, and displays startup failures. Installed Windows Server x64 navigation and workflow checks pass. The owner-device issue remains open until retested.
- Windows Server 2022 x64 and Windows 11 Enterprise ARM64 with the x64 app under emulation now pass build/install/source+packaged+installed workflows/export/uninstall. Packaged app PATH isolation also passes. Clean Windows 10 x64 and native Intel/AMD Windows 11/device acceptance remain untested. See CURRENT-VERIFICATION.md.
- The media supplier supports Windows10 22H2 minimum; earlier Windows10 is not covered. Clean Windows 10/native Intel/AMD Windows 11 client compatibility remains untested.
- Media archive/executable hashes are verified; final dependency/security/notices/corresponding-source review remains open. Current Linux and Windows npm audits report zero known advisories after dependency overrides; this does not complete a security review.
- Rendered preview preparation can be slow. Large/long projects, hardware behavior and performance need broader acceptance.
- Forced-save termination and injected ENOSPC pass; physical power-loss/full-disk and broader app/export interruption tests remain incomplete.
- Trim handles trim inward; extension is numeric. Transitions/animation remain basic. Keyboard clip selection, named controls and visible focus have focused automated coverage; screen-reader and native Windows assistive-technology acceptance remain open.
- Optional external services have fixture coverage and real local neural speech is demonstrated. Optional Pexels video search and selected download/import are implemented; live provider acceptance remains untested without an API key. Provider captions require timeline-offset review.
- Native dialog/device tests and full human auditory review remain open. No professional-product parity or100% completion claim.
