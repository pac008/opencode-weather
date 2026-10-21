import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { readFileSync, writeFileSync } from "fs";
import { loadConfig, saveConfig } from "../../src/storage/configStorage";
import { CONFIG_PATH_ENV_VAR } from "../../src/utils/constants";
import { useTempConfigPath } from "../helpers/tempConfig";

let cleanup: () => void;
let configPath: string;

beforeEach(() => {
  cleanup = useTempConfigPath();
  configPath = process.env[CONFIG_PATH_ENV_VAR] as string;
});

afterEach(() => {
  cleanup();
});

describe("loadConfig", () => {
  test("devuelve la configuración por defecto si el archivo no existe", () => {
    expect(loadConfig()).toEqual({ cities: [], units: "°C" });
  });

  test("lee la configuración guardada", () => {
    const city = { name: "Ottawa", latitude: 45.4, longitude: -75.7 };
    writeFileSync(configPath, JSON.stringify({ cities: [city], units: "°F", defaultCity: city }));

    const config = loadConfig();

    expect(config.cities).toEqual([city]);
    expect(config.units).toBe("°F");
    expect(config.defaultCity).toEqual(city);
  });

  test("devuelve la configuración por defecto si el JSON está corrupto", () => {
    writeFileSync(configPath, "{ no es json");

    expect(loadConfig()).toEqual({ cities: [], units: "°C" });
  });

  test("rellena cities y units si el archivo está incompleto", () => {
    writeFileSync(configPath, JSON.stringify({}));

    expect(loadConfig()).toEqual({ cities: [], units: "°C" });
  });

  test("no muta la configuración por defecto entre llamadas", () => {
    const first = loadConfig();
    first.cities.push({ name: "Falsa", latitude: 0, longitude: 0 });

    expect(loadConfig().cities).toEqual([]);
  });
});

describe("saveConfig", () => {
  test("escribe la configuración en formato JSON legible", () => {
    const city = { name: "Ottawa", latitude: 45.4, longitude: -75.7 };

    saveConfig({ cities: [city], units: "°C", defaultCity: city });

    const raw = readFileSync(configPath, "utf-8");
    expect(raw).toContain("\n  ");
    expect(JSON.parse(raw)).toEqual({ cities: [city], units: "°C", defaultCity: city });
  });

  test("no lanza cuando la ruta no es escribible", () => {
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});
    process.env[CONFIG_PATH_ENV_VAR] = "/ruta/inexistente/directorio/config.json";

    expect(() => saveConfig({ cities: [], units: "°C" })).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
