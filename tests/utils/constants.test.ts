import { describe, expect, test } from "bun:test";
import {
  CONFIG_PATH_ENV_VAR,
  DEFAULT_CONFIG,
  DEFAULT_CONFIG_PATH,
  FORECAST_API_URL,
  GEOCODING_API_URL,
  GEOCODING_LANGUAGE,
  GEOCODING_RESULT_COUNT,
  MENU_SEPARATOR,
} from "../../src/utils/constants";

describe("constantes", () => {
  test("la ruta por defecto termina en .weather-cli.json", () => {
    expect(DEFAULT_CONFIG_PATH.endsWith(".weather-cli.json")).toBe(true);
  });

  test("expone el nombre de la variable de entorno del config", () => {
    expect(CONFIG_PATH_ENV_VAR).toBe("WEATHER_CLI_CONFIG_PATH");
  });

  test("la configuración por defecto no tiene ciudades y usa °C", () => {
    expect(DEFAULT_CONFIG).toEqual({ cities: [], units: "°C" });
  });

  test("el separador del menú son 117 caracteres", () => {
    expect(MENU_SEPARATOR).toBe("═".repeat(117));
  });

  test("las URLs apuntan a OpenMeteo", () => {
    expect(GEOCODING_API_URL).toContain("geocoding-api.open-meteo.com");
    expect(FORECAST_API_URL).toContain("api.open-meteo.com");
  });

  test("el geocoding pide un resultado en español", () => {
    expect(GEOCODING_RESULT_COUNT).toBe("1");
    expect(GEOCODING_LANGUAGE).toBe("es");
  });
});
