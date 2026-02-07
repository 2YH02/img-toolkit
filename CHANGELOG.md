# Changelog

All notable changes to this project will be documented in this file.

## [2.1.1] - 2026-02-08

### Fixed
- Added package metadata (`repository`, `homepage`, `bugs`) in `package.json` to satisfy npm provenance validation during GitHub Actions publish.
- Hardened worker-based example flow to reject and clear pending requests when worker initialization/message errors occur, and added request timeout handling to prevent indefinite hangs.
- Added graceful WebP fallback in TypeScript wrapper: when browser lossy WebP APIs are unavailable, processing falls back to wasm WebP (lossless) instead of hard-failing.
- Restricted exposed user-facing errors to generic messages while keeping detailed diagnostics in internal logs.

### Docs
- Added image quality comparison section in README and moved comparison assets under `docs/assets/quality`.

## [2.1.0] - 2026-02-07

### Added
- Modular API in TypeScript wrapper:
  - `processImage(file, options)`
  - `resize(file, options)`
  - `convertFormat(file, options)`
  - `adjustBrightness(file, options)`
- Rust unit tests for:
  - brightness mapping
  - resampling filter mapping
  - format parsing
  - aspect ratio helper calculations
- CI workflow (`.github/workflows/ci.yml`) to run:
  - `cargo test`
  - `npm run build:ts`

### Changed
- Example playground updated for modular 2.1.0 APIs.
- Example UI redesigned with a modern glass theme.
- Package exports clarified as ESM (`type: module`, removed invalid `require` target).
- Type and README docs now explicitly describe `quality` behavior by format.
- WebP `quality` is now applied by default via the browser's native lossy WebP encoder path.
- Removed `webpLossless` option from the public API and example UI.

### Fixed
- Removed JPEG re-encode path when output format is PNG/WebP to avoid unnecessary quality loss and alpha-channel issues.
- Normalized wasm output to a BlobPart-safe `Uint8Array` before constructing `File`.

### Performance
- Reduced PNG encoder compression level from `Best` to `Default` for faster encode times.
- Example playground now offloads image processing to a Web Worker to reduce UI blocking.

### Deprecated
- `resizeImage(file, options)` is deprecated in 2.x.
  Use `processImage`, `resize`, `convertFormat`, or `adjustBrightness`.
  Planned removal: `3.0.0`.
