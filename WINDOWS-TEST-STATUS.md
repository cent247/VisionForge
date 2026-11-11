# Windows status — build/static checks passed; runtime untested

Both NSIS installer and portable candidates now cross-build on Linux without GitHub or executing Wine. Upstream UninstallerReader extracts the intermediate uninstaller. The final executable payloads pass extraction/CRC/header/resource/hash inspection, including matched Windows media binaries and font/licenses. See evidence/alternative-testing.

This is not an install, launch, device-audio, playback, export or uninstall pass on Windows10/11. No native Windows test host is connected and no owner testing is requested. Software-emulated virtual machines are a possible future route, but no licensed Windows guest/test environment has been provisioned or validated here. Do not infer that lack of KVM alone makes software emulation impossible.

The media supplier specifies Windows10 22H2 as its minimum supported Windows version. Older Windows10 is not covered by this candidate. Final native compatibility, dependency/license/source review and acceptance remain required. The candidates are unsigned and marked internal. They are not a finished release.

The saved Windows candidates predate the attached-cover-art import correction. Rebuild and repeat package inspection before treating candidates as matching current source.
