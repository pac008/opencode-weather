import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { setDefaultCity } from "../../src/actions/setDefaultCity";
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
  writeTempConfig({ cities: [ottawa, paris] });
  capture.restore();
  capture = captureConsole();
  mockFetch(() => new Response(JSON.stringify({ results: [ottawa] }), { status: 200 }));
});

afterEach(() => {
  cleanup();
  restoreFetch();
  restoreStdin();
});

function output(): string {
  return capture.lines.join("\n");
}

describe("setDefaultCity", () => {
  test("muestra la lista de ciudades", async () => {
    mockStdin(["0"]);

    await setDefaultCity();

    expect(output()).toContain("Selecciona ciudad por defecto:");
    expect(output()).toContain("1. Ottawa, Canadá");
  });

  test("establece la ciudad seleccionada por defecto", async () => {
    mockStdin(["1"]);

    await setDefaultCity();

    expect(readTempConfig().defaultCity).toEqual(ottawa);
    expect(output()).toContain("Ciudad por defecto: Ottawa, Canadá");
  });

  test("cancela si el número no es válido", async () => {
    mockStdin(["0"]);

    await setDefaultCity();

    expect(readTempConfig().defaultCity).toBeUndefined();
    expect(output()).toContain("Cancelado.");
  });

  test("avisa si no hay ciudades registradas", async () => {
    writeTempConfig({ cities: [] });
    mockStdin([]);

    await setDefaultCity();

    expect(output()).toContain("No hay ciudades registradas.");
  });

  test("ofrece agregar una ciudad si no hay ninguna", async () => {
    writeTempConfig({ cities: [] });
    mockStdin(["s", "Ottawa", "s", "n"]);

    await setDefaultCity();

    expect(readTempConfig().cities).toEqual([ottawa]);
  });

  test("no agrega una ciudad si el usuario no lo pide", async () => {
    writeTempConfig({ cities: [] });
    mockStdin(["n"]);

    await setDefaultCity();

    expect(readTempConfig().cities).toEqual([]);
  });
});
