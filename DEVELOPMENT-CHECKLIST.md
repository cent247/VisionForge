# Development checklist

- [x] Audit/recover source and preserve it in GitHub
- [x] Test deterministic preview/export, audio timing, editing/history, captions and project recovery
- [x] Export and validate a genuine >=120s documentary through the app
- [x] Pass current Linux TypeScript/build, 44 automated tests and 13 desktop checks
- [x] Pass hosted Windows Server 2022 native build, 43 tests (one privileged fixture skipped), three 13-step desktop workflows with 20 seek cycles each, installation and uninstallation
- [x] Patch reported build dependency advisories; current Linux/Windows npm audits report zero
- [x] Pass Windows 11 Enterprise ARM64 x64-emulation workflow and packaged runtime PATH isolation on both hosted Windows targets
- [ ] Clean Windows 10 x64 and native Intel/AMD Windows 11/device/native-dialog acceptance
- [ ] Complete corresponding-source/licensing and comprehensive security review
- [ ] Complete broader performance/reliability/usability/accessibility/live-provider acceptance
- [ ] Validate final guide and installer; deliver only after remaining gates pass
