# AGENTS.md

## Project Overview
`img-toolkit` is a Rust + WebAssembly image processing library published to npm.
The Rust core handles decode/transform/encode, and the TypeScript wrapper exposes the browser-facing API.

## Key Files
- `src/lib.rs`: Rust/WASM core pipeline (option parsing, resize/brightness, format encode/decode, Rust tests).
- `ts-wrapper/resizeImage.ts`: TypeScript public API wrapper used by app code.
- `example/imageWorker.js`: Worker-side integration example for async image processing.
- `Cargo.toml`: Rust crate config and dependencies.
- `package.json`: npm package metadata, scripts, and build entrypoints.
- `README.MD`: user-facing API docs and usage examples; update when behavior/API changes.

## Common Commands
- `cargo test`: run Rust unit tests for core behavior.
- `npm run build:wasm`: build wasm artifacts from Rust (`wasm-pack build --target web`).
- `npm run build:ts`: compile TypeScript wrapper/types.
- `npm run build`: full package build (`build:wasm` + `build:ts`).

Run the smallest relevant command first, then run the full build before final handoff.

## Working Rules
- Preserve 2.x API compatibility unless a breaking change is explicitly requested.
- Keep user-facing errors safe and generic; avoid exposing low-level internals.
- Validate/sanitize options (clamp ranges, handle non-finite values).
- Do not remove `jpg/jpeg`, `png`, or `webp` support unless explicitly requested.
- Keep changes focused; avoid unrelated refactors.
- If API/default behavior changes, update `README.MD` and relevant examples in `example/`.
