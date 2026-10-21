import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { main } from "../src/index";
import type { City } from "../src/types/City";
import { captureConsole } from "./helpers/captureConsole";
import { mockFetch, restoreFetch } from "./helpers/fetchMock";
import { mockStdin, restoreStdin, writtenOutput } from "./helpers/stdin";
import { readTempConfig, useTempConfigPath, writeTempConfig } from "./helpers/tempConfig";

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
const madrid: City = {
  name: "Madrid",
  country: "España",
  latitude: 40.4165,
  longitude: -3.70256,
};

let cleanup: () => void;
let capture = captureConsole();

beforeEach(() => {
  cleanup = useTempConfigPath();
  writeTempConfig({ cities: [ottawa, paris], defaultCity: ottawa });
  capture.restore();
  capture = captureConsole();
  spyOn(console, "clear").mockImplementation(() => {});
  spyOn(process.stdin, "pause").mockImplementation(() => process.stdin);
  mockFetch((url) =>
    url.includes("geocoding")
      ? new Response(JSON.stringify({ results: [madrid] }), { status: 200 })
      : new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }),
  );
});

afterEach(() => {
  cleanup();
  restoreFetch();
  restoreStdin();
  spyOn(console, "clear").mockRestore();
  spyOn(process.stdin, "pause").mockRestore();
});

function output(): string {
  return capture.lines.join("\n");
}

describe("main", () => {
  test("muestra el menú con el número de ciudades y las unidades", async () => {
    mockStdin(["9"], "9");

    await main();

    expect(output()).toContain("WEATHER CLI");
    expect(output()).toContain("1. Clima de ciudad default");
    expect(output()).toContain("2. Clima de todas las ciudades (2)");
    expect(output()).toContain("8. Ajustes (°C)");
    expect(output()).toContain("9. Salir");
  });

  test("ejecuta la acción de la opción elegida", async () => {
    mockStdin(["3", "Madrid", "s", "n", "9"], "9");

    await main();

    expect(readTempConfig().cities).toHaveLength(3);
    expect(output()).toContain("Ciudad agregada correctamente.");
  });

  test("muestra el clima con la opción 1", async () => {
    mockStdin(["1", "9"], "9");

    await main();

    expect(output()).toContain("Clima de Ottawa, Canadá: 10.7 °C");
  });

  test("avisa de una opción inválida", async () => {
    mockStdin(["42", "9"], "9");

    await main();

    expect(output()).toContain("Opción inválida. Intenta de nuevo.");
  });

  test("saluda y termina con la opción 9", async () => {
    mockStdin(["9"], "9");

    await main();

    expect(output()).toContain("¡Hasta luego!");
  });

  test("pide pulsar ENTER para volver al menú", async () => {
    mockStdin(["1", "9"], "9");

    await main();

    expect(writtenOutput()).toContain("Presiona ENTER para volver al menú...");
  });
});
