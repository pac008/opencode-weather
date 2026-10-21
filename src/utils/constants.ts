import { homedir } from "os";
import { join } from "path";
import type { Config } from "../types/Config";

export const CONFIG_PATH = join(homedir(), ".weather-cli.json");

export const DEFAULT_CONFIG: Config = {
  cities: [],
  units: "°C",
};

export const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

export const GEOCODING_RESULT_COUNT = "1";
export const GEOCODING_LANGUAGE = "es";

export const MENU_SEPARATOR = "═".repeat(117);
