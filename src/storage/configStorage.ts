import { existsSync, readFileSync, writeFileSync } from "fs";
import type { Config } from "../types/Config";
import { CONFIG_PATH_ENV_VAR, DEFAULT_CONFIG, DEFAULT_CONFIG_PATH } from "../utils/constants";
import { c } from "../utils/colors";

function configPath(): string {
  return process.env[CONFIG_PATH_ENV_VAR] || DEFAULT_CONFIG_PATH;
}

export function loadConfig(): Config {
  try {
    const path = configPath();
    if (!existsSync(path)) return structuredClone(DEFAULT_CONFIG);
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Config;
    // asegurar valores por defecto
    if (!parsed.cities) parsed.cities = [];
    if (!parsed.units) parsed.units = DEFAULT_CONFIG.units;
    return parsed;
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(config: Config): void {
  try {
    writeFileSync(configPath(), JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error(c.red("Error guardando configuración:"), err);
  }
}
