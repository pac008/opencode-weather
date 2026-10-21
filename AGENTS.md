# AGENTS.md

## Commands
- **Run CLI:** `bun index.ts` (root launcher) or `bun src/index.ts` (real entrypoint). `bun run start` / `bun run dev` also work (they run the test suite first).
- **Test:** `bun test` (suite in `tests/`).
- **Typecheck:** `bun check`.
- **Verify (gate):** `bun run verify` = `bun run test && bun run typecheck`.
- **Build executable:** `bun run build` → `bun build --compile index.ts --outfile weather`.

## Gate
- **`start`, `dev` and `build` do not run if the suite is red.** The `pre<script>` hooks (`prestart`, `predev`, `prebuild`) call `bun run verify` first and abort with a non-zero exit code.
- `bun index.ts` run directly is **not** gated; use `bun run start` when you need the guarantee.

## Architecture
- **Layered Bun CLI:** `index.ts` (root) is a thin launcher that calls `main()` from `src/index.ts`. ES module, `"type": "module"`.
- **Layers under `src/`:** `actions/` (use cases) → `presentation/` (console I/O) → `api/` (OpenMeteo) → `storage/` (config file), with shared contracts in `types/` and helpers in `utils/`.
- **Dependency rule:** `actions` orchestrate `presentation` + `storage` + `api`; `presentation` never touches `storage`; `storage` never touches `api`.
- **State:** the source of truth is `~/.weather-cli.json`, read/written through `src/storage/`. Actions do not share an in-memory config object.
- **Config path:** `~/.weather-cli.json` by default; `WEATHER_CLI_CONFIG_PATH` overrides it (used by the tests to isolate the real file).
- **APIs:** OpenMeteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) and OpenMeteo Forecast (`https://api.open-meteo.com/v1/forecast`) (see `README.md` for exact query params). Use `fetch` with Bun.

## Testing
- **Suite:** `tests/` with `bun:test` (no extra dependencies). One file per module, mirroring `src/`.
- **Boundaries, not module mocks:** `mock.module` is process-global and irreversible in Bun 1.4 — it poisons other test files. Control the real boundaries instead: stdin (`tests/helpers/stdin.ts`), `fetch` (`tests/helpers/fetchMock.ts`), stdout (`tests/helpers/captureConsole.ts`) and the config file (`tests/helpers/tempConfig.ts`).
- **Isolation:** the config path points to a temp file (`WEATHER_CLI_CONFIG_PATH`); the real `~/.weather-cli.json` is never touched. `bunfig.toml` preloads `tests/helpers/setup.ts` to force `NO_COLOR=1` so text assertions are deterministic.
- **New behaviour needs a test** in the matching `tests/` file.

## Conventions & Gotchas
- **Runtime:** Bun + TypeScript (`@types/bun`, TypeScript ^7 peer). Prefer `bun` CLI over `node/npm`.
- **No lint/format/CI:** none configured. `bun run verify` is the only gate.
- **Style:** English identifiers; Spanish comments only if they add value (matches existing README style).
- **Minimal scope:** Keep structure simple and layered; avoid unnecessary dependencies unless required for the CLI features in README.
- **Executable source of truth:** Trust `package.json` scripts/config over prose if anything conflicts.
