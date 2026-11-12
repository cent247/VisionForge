# Known issues — owner installation handoff remains held

- Windows Server 2022 x64 and Windows 11 Enterprise ARM64 with the x64 app under emulation now pass build/install/source+packaged+installed workflows/export/uninstall. Packaged app PATH isolation also passes. Clean Windows 10 x64 and native Intel/AMD Windows 11/device acceptance remain untested. See CURRENT-VERIFICATION.md.
- The media supplier supports Windows10 22H2 minimum; earlier Windows10 is not covered. Actual compatibility is untested.
- Media archive/executable hashes are verified; final dependency/security/notices/corresponding-source review remains open. Current Linux and Windows npm audits report zero known advisories after dependency overrides; this does not complete a security review.
- Rendered preview preparation can be slow. Large/long projects, hardware behavior and performance need broader acceptance.
- Forced-save termination and injected ENOSPC pass; physical power-loss/full-disk and broader app/export interruption tests remain incomplete.
- Trim handles trim inward; extension is numeric. Transitions/animation and keyboard/accessibility coverage remain basic.
- Optional external services have fixture coverage and real local neural speech is demonstrated. Remote stock search is not implemented. Provider captions require timeline-offset review.
- Native dialog/device tests and full human auditory review remain open. No professional-product parity or100% completion claim.
