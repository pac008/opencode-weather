import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getAllCitiesWeather, getDefaultCityWeather } from "../../src/actions/getWeather";
import type { City } from "../../src/types/City";
import { captureConsole } from "../helpers/captureConsole";
import { mockFetch, restoreFetch } from "../helpers/fetchMock";
import { mockStdin, restoreStdin } from "../helpers/stdin";
import { readTempConfig, useTempConfigPath, writeTempConfig } from "../helpers/tempConfig";

const ottawa: City = {
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
};
const paris: City = {
  name: "París",
  country: "Francia",
  latitude: 48.85341,
  longitude: 2.3488,
};

let cleanup: () => void;
let capture = captureConsole();

beforeEach(() => {
  cleanup = useTempConfigPath();
  writeTempConfig({ cities: [ottawa, paris], defaultCity: ottawa });
  capture.restore();
  capture = captureConsole();
  mockFetch(() => new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }));
});

afterEach(() => {
  cleanup();
  restoreFetch();
  restoreStdin();
});

function output(): string {
  return capture.lines.join("\n");
}

describe("getDefaultCityWeather", () => {
  test("muestra el clima de la ciudad por defecto", async () => {
    await getDefaultCityWeather();

    expect(output()).toContain("Clima de Ottawa, Canadá: 10.7 °C");
  });

  test("usa las unidades configuradas", async () => {
    writeTempConfig({ cities: [ottawa], defaultCity: ottawa, units: "°F" });
    mockFetch(() => new Response(JSON.stringify({ current: { temperature_2m: 51.3 } }), { status: 200 }));

    await getDefaultCityWeather();

    expect(output()).toContain("Clima de Ottawa, Canadá: 51.3 °F");
  });

  test("informa si no se pudo obtener el clima", async () => {
    mockFetch(() => new Response("{}", { status: 500 }));

    await getDefaultCityWeather();

    expect(output()).toContain("No se pudo obtener el clima de Ottawa, Canadá.");
  });

  test("avisa si no hay ciudad por defecto configurada", async () => {
    writeTempConfig({ cities: [ottawa] });
    mockStdin([]);

    await getDefaultCityWeather();

    expect(output()).toContain("No hay ciudad por defecto configurada.");
  });

  test("ofrece establecer la ciudad por defecto", async () => {
    writeTempConfig({ cities: [ottawa] });
    mockStdin(["s", "1"]);

    await getDefaultCityWeather();

    expect(readTempConfig().defaultCity).toEqual(ottawa);
  });
});

describe("getAllCitiesWeather", () => {
  test("muestra el clima de todas las ciudades", async () => {
    await getAllCitiesWeather();

    expect(output()).toContain("Clima de todas las ciudades:");
    expect(output()).toContain("- Ottawa, Canadá: 10.7 °C");
    expect(output()).toContain("- París, Francia: 10.7 °C");
  });

  test("informa del error de las ciudades que fallan", async () => {
    let call = 0;
    mockFetch(() => {
      call += 1;
      return call === 1
        ? new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 })
        : new Response("{}", { status: 500 });
    });

    await getAllCitiesWeather();

    expect(output()).toContain("- Ottawa, Canadá: 10.7 °C");
    expect(output()).toContain("- París, Francia: Error al obtener clima");
  });

  test("avisa si no hay ciudades registradas", async () => {
    writeTempConfig({ cities: [] });
    mockStdin([]);

    await getAllCitiesWeather();

    expect(output()).toContain("No hay ciudades registradas.");
  });

  test("ofrece agregar una ciudad si no hay ninguna", async () => {
    writeTempConfig({ cities: [] });
    mockStdin(["s", "Ottawa", "s", "n"]);
    mockFetch((url) =>
      url.includes("geocoding")
        ? new Response(JSON.stringify({ results: [ottawa] }), { status: 200 })
        : new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }),
    );

    await getAllCitiesWeather();

    expect(readTempConfig().cities).toEqual([ottawa]);
  });
});
