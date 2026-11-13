# Focused security review

Reviewed main-frame IPC authorization, project/media paths, custom media responses,
preview cache access and cleanup, optional service endpoint/upload boundaries,
and renderer browser permissions. This is a targeted source review and Linux
regression check, not a comprehensive security audit.

## Fixed

- Overlay image IPC previously wrote to a lexical media path without checking
  whether the media directory was redirected outside the project. It now checks
  the canonical project media root, rejects non-PNG payloads by PNG signature,
  and uses exclusive file creation.
- Preview preparation previously followed a redirected cache directory and could
  prune external MP4 files. It now rejects redirected cache directories, rejects
  non-regular cached outputs, and skips non-regular entries during pruning.
- Production windows now apply a restrictive response Content Security Policy:
  no direct renderer connections, inline scripts, frames, objects, or forms.
  Styles retain inline support for React layout. Media uses the authorized
  vfmedia scheme. Optional services remain main-process requests.
- Browser permission requests and permission checks now deny access by default.

## Verification performed

- TypeScript typecheck, test compilation and production build passed.
- The security desktop regression passed real Electron UI loading,
  injected-inline-script blocking, renderer-fetch blocking, valid overlay import,
  non-PNG rejection, and redirected-media-directory rejection with no external
  writes. Evidence: security-desktop.json and security-desktop.log.
- A focused real-filesystem preview test passed: a redirected cache directory
  containing five external MP4 files is rejected, all five remain unchanged.
  Evidence: security-preview.log.
- The development renderer URL does not receive the production CSP so Vite
  development/HMR remains allowed; development mode was checked by source
  inspection, not an end-to-end HMR run.
- The desktop security regression is included in npm run verify.

## Limits and remaining work

Subsequent hosted Windows Server 2022 x64 and Windows 11 ARM/x64-emulation reruns passed these changes, including installed security tests; see windows-parallel-review-success.json. Clean Windows 10/native Intel/AMD Windows 11 acceptance remains open.
The fixes validate the filesystem state when operations begin; hostile concurrent
filesystem mutation/reparse-point races are not claimed solved. PNG signature
validation is not exhaustive image-format validation. Media parser sandboxing,
fuzzing, complete IPC/session lifecycle review, OS-native permissions, clean-device
acceptance and complete dependency/supply-chain/security review remain open.
