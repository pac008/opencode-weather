# AGENTS.md

## Commands
- **Run CLI:** `bun index.ts` (root launcher) or `bun src/index.ts` (real entrypoint). `bun run start` / `bun run dev` also work.
- **Typecheck:** `bun check` (only verification script in `package.json`). Run after changes.
- **Build executable:** `bun build ./index.ts --compile --outfile weather` (matches README intent to produce a standalone binary).

## Architecture
- **Layered Bun CLI:** `index.ts` (root) is a thin launcher that calls `main()` from `src/index.ts`. ES module, `"type": "module"`.
- **Layers under `src/`:** `actions/` (use cases) → `presentation/` (console I/O) → `api/` (OpenMeteo) → `storage/` (config file), with shared contracts in `types/` and helpers in `utils/`.
- **Dependency rule:** `actions` orchestrate `presentation` + `storage` + `api`; `presentation` never touches `storage`; `storage` never touches `api`.
- **State:** the source of truth is `~/.weather-cli.json`, read/written through `src/storage/`. Actions do not share an in-memory config object.
- **APIs:** OpenMeteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) and OpenMeteo Forecast (`https://api.open-meteo.com/v1/forecast`) (see `README.md` for exact query params). Use `fetch` with Bun.

## Conventions & Gotchas
- **Runtime:** Bun + TypeScript (`@types/bun`, TypeScript ^7 peer). Prefer `bun` CLI over `node/npm`.
- **No tests/lint/format/CI:** none configured. Do not invent them; `bun check` is the only gate.
- **Style:** English identifiers; Spanish comments only if they add value (matches existing README style).
- **Minimal scope:** Keep structure simple and layered; avoid unnecessary dependencies unless required for the CLI features in README.
- **Executable source of truth:** Trust `package.json` scripts/config over prose if anything conflicts.