# Media-folder boundary repair

Preview, export and media streaming now reject a media-folder symlink/junction whose canonical directory is outside the project. Previously import/relink applied this check but playback/rendering did not consistently do so. Shared root validation now applies to those paths.

A real directory-symlink fixture on Linux passes; the same test uses a Windows junction (no symlink privilege requirement) on Windows. It asserts preview/export rejection and preservation of the previous completed output. Linux TypeScript/build, 43 automated tests and the 12-step Electron desktop workflow pass; evidence/media-root-verification.txt. Windows verification of this latest production change is pending. Full security review remains open.
