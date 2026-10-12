# AGENTS.md

## Commands
- **Run CLI:** `bun index.ts` (entrypoint is `index.ts`; no `start` script).
- **Typecheck:** `bun check` (only verification script in `package.json`). Run after changes.
- **Build executable:** `bun build ./index.ts --compile --outfile weather` (matches README intent to produce a standalone binary).

## Architecture
- **Single-file Bun CLI:** `index.ts` (ES module, `"type": "module"`). `package.json` sets `"module": "index.ts"`.
- **APIs:** OpenMeteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) and OpenMeteo Forecast (`https://api.open-meteo.com/v1/forecast`) (see `README.md` for exact query params). Use `fetch` with Bun.

## Conventions & Gotchas
- **Runtime:** Bun + TypeScript (`@types/bun`, TypeScript ^7 peer). Prefer `bun` CLI over `node/npm`.
- **No tests/lint/format/CI:** none configured. Do not invent them; `bun check` is the only gate.
- **Style:** English identifiers; Spanish comments only if they add value (matches existing README style).
- **Minimal scope:** Keep structure simple (single-file now). Avoid unnecessary dependencies unless required for the CLI features in README.
- **Executable source of truth:** Trust `package.json` scripts/config over prose if anything conflicts.