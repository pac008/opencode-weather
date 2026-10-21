import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { Config } from "../../src/types/Config";
import { CONFIG_PATH_ENV_VAR } from "../../src/utils/constants";

/** Redirige el config a un archivo temporal. Devuelve la función de limpieza. */
export function useTempConfigPath(): () => void {
  const dir = mkdtempSync(join(tmpdir(), "weather-cli-test-"));
  const configPath = join(dir, "config.json");
  process.env[CONFIG_PATH_ENV_VAR] = configPath;

  return () => {
    delete process.env[CONFIG_PATH_ENV_VAR];
    rmSync(dir, { recursive: true, force: true });
  };
}

/** Escribe una configuración inicial en el archivo temporal. */
export function writeTempConfig(config: Partial<Config> = {}): void {
  const configPath = process.env[CONFIG_PATH_ENV_VAR];
  if (!configPath) throw new Error("useTempConfigPath() debe llamarse antes");
  const full: Config = { cities: [], units: "°C", ...config };
  writeFileSync(configPath, JSON.stringify(full, null, 2), "utf-8");
}

/** Lee la configuración persistida en el archivo temporal. */
export function readTempConfig(): Config {
  const configPath = process.env[CONFIG_PATH_ENV_VAR];
  if (!configPath) throw new Error("useTempConfigPath() debe llamarse antes");
  return JSON.parse(readFileSync(configPath, "utf-8")) as Config;
}
