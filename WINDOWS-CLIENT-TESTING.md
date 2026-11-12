# Expanded Windows verification — pending

Windows 10/11 x64 remains the release target. No owner-PC testing is requested.

The hosted matrix now includes Windows Server 2022 x64 and Windows 11 ARM64 running the x64 Node/Electron/application/tool binaries under emulation. Setup Node explicitly selects x64; installer target remains x64. Each job records actual Windows edition/version and host architecture. Windows 11 ARM emulation is additional client-OS compatibility coverage; it is not native Intel/AMD Windows 11 hardware acceptance or Windows 10 acceptance.

Packaged/installed app launches remove Node/Python configuration and the development tool directories from the child PATH. Only Windows and System32 remain. The test asserts packaged execution, bundled FFmpeg/FFprobe/font paths and files, then performs import, preview, export and the rest of the desktop workflow. Parent fixture generation still uses developer tools outside the isolated app process. This is not a pristine machine image and does not prove that every possible system dependency is absent.

The unchanged Linux desktop workflow passes with the new harness (evidence/isolated-runtime-linux-regression.txt). Windows matrix results are pending; no new pass is claimed yet.

Runner source: https://docs.github.com/en/actions/reference/runners/github-hosted-runners . Standard public repository runners include windows-11-arm; no larger/paid runner is configured.
