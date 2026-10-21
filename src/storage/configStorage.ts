import { existsSync, readFileSync, writeFileSync } from "fs";
import type { Config } from "../types/Config";
import { CONFIG_PATH, DEFAULT_CONFIG } from "../utils/constants";
import { c } from "../utils/colors";

export function loadConfig(): Config {
  try {
    if (!existsSync(CONFIG_PATH)) return structuredClone(DEFAULT_CONFIG);
    const raw = readFileSync(CONFIG_PATH, "utf-8");
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
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error(c.red("Error guardando configuración:"), err);
  }
}
