import { homedir } from "os";
import { join } from "path";
import type { Config } from "../types/Config";

export const DEFAULT_CONFIG_PATH = join(homedir(), ".weather-cli.json");

/** Permite redirigir el archivo de configuración (tests, sandboxes). */
export const CONFIG_PATH_ENV_VAR = "WEATHER_CLI_CONFIG_PATH";

export const DEFAULT_CONFIG: Config = {
  cities: [],
  units: "°C",
};

export const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

export const GEOCODING_RESULT_COUNT = "1";
export const GEOCODING_LANGUAGE = "es";

export const MENU_SEPARATOR = "═".repeat(117);
