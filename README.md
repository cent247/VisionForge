# VisionForge

Local Windows video editor built with Electron, React and TypeScript — **development, not a finished release**.

[Current verification and remaining gates](CURRENT-VERIFICATION.md) · [Development PR](https://github.com/cent247/VisionForge/pull/1)

Windows Server 2022 x64 and Windows 11 Enterprise on ARM64 (x64 application under emulation) pass native installer builds, 43 tests each (one skipped), source/packaged/installed desktop workflows, silent installation and uninstallation. Packaged workflows also pass with the child PATH restricted to Windows directories and bundled media tools/fonts asserted. Both npm audits report zero known advisories.

Clean Windows 10 x64, native Intel/AMD Windows 11/device checks, final licensing/security and broader performance/usability acceptance remain open. No owner dependency installation or interim testing is requested. Documentary script, source/license metadata and validation are in production/night-side.
