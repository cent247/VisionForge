# Preview seek stabilization

A packaged desktop attempt timed out waiting for seek position 2.8s. The following media-root run (43131467249, commit 8a39a0d061f270f66ae6e31df485c3e49f0606b2) passed all source/packaged/installed desktop, native build/install/uninstall stages, with the same dependency overrides. This means the first failure is intermittent, not established as a dependency incompatibility.

Preview seeks now synchronize through useLayoutEffect before browser media events can report an old clock value after a requested position change. Decode errors now display an explicit playback error. The desktop suite adds five repeated play/pause/seek cycles; failure reports include video state, requested position and UI status. Local TypeScript/build and all 13 desktop checks pass. Windows verification of this latest preview change is pending; do not treat the earlier run as a pass for this revision.
