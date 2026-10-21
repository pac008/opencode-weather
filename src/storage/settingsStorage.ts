import type { Units } from "../types/Weather";
import { loadConfig, saveConfig } from "./configStorage";

export function readUnits(): Units {
  return loadConfig().units;
}

export function flipUnits(): Units {
  const config = loadConfig();
  config.units = config.units === "°C" ? "°F" : "°C";
  saveConfig(config);
  return config.units;
}
