# Optional Pexels video integration

Implemented explicit query/key search and selected MP4 download/import. Search uses the fixed provider endpoint `https://api.pexels.com/v1/videos/search`, as documented at https://www.pexels.com/api/documentation/ (video endpoints moved to /v1/videos/). The UI displays a prominent Pexels link, creator names, source review controls and imported credits. No search, thumbnail request, project/script upload or video download occurs automatically.

The key remains React session state and the explicit search IPC/request only; it is neither persisted nor retained with selection tokens, nor forwarded to video CDN hosts. Search results carry expiring opaque selections scoped to the requesting editor window. Main-process fetches use bounded response sizes, timeouts, HTTPS host restrictions, no authenticated API redirects, and a maximum of three allowlisted CDN redirects. Selected downloads are streamed to private temporary files with a 200MB limit, inspected as real video, then imported with the existing transactional media manager. Metadata preserves provider/item/page/creator/license URL, timestamp and actual downloaded SHA256. Shared project validation bounds this provenance. Relinking clears previous stock provenance.

A monotonically increasing UI request generation prevents old results or downloads from mutating the editor after a project change or unmount, including switching away and returning to the same path. The key can be cleared explicitly.

## Verification

- TypeScript typecheck and production build passed.
- Three focused unit tests passed: fixed search endpoint and Authorization; owner/expiry/clear selection rules; no key on CDN requests or saved metadata; real MP4 import; malformed, oversized and unsafe-redirect downloads leave project media unchanged; unsafe URL rejection before networking; invalid source metadata rejection; relinking removes stale provenance.
- The actual Electron UI fixture passed explicit search, selected real MP4 import, saving/recovering provider credit/hash without the key, key-free CDN requests, delayed old-project download isolation after selecting another project, and explicit key clearing. See stock-desktop.json. Main API/download responses were fixtures and the imported MP4 was locally generated.
- `test:stock` and `test:keyboard` are included in the integrated `verify` command. Tests are also available for installed Windows runs.

## Limits

No live Pexels credential was available. Live authentication/quota/real CDN acceptance remains open and is not represented by fixture passes. Only MP4 renditions up to 1920 pixels per dimension on the explicit supported CDN hosts are offered. Unsupported hosts/renditions are skipped or rejected. Provider terms and source usage still need the user's review for the intended production. This implementation is not a rights-clearance claim or a complete arbitrary-host downloader.
