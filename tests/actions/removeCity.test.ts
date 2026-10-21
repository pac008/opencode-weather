import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { removeCity } from "../../src/actions/removeCity";
import type { City } from "../../src/types/City";
import { captureConsole } from "../helpers/captureConsole";
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
});

afterEach(() => {
  cleanup();
  restoreStdin();
});

function output(): string {
  return capture.lines.join("\n");
}

describe("removeCity", () => {
  test("muestra la lista de ciudades registradas", async () => {
    mockStdin(["0"]);

    await removeCity();

    expect(output()).toContain("Ciudades registradas:");
    expect(output()).toContain("1. Ottawa, Canadá");
    expect(output()).toContain("2. París, Francia");
  });

  test("elimina la ciudad seleccionada", async () => {
    mockStdin(["2"]);

    await removeCity();

    expect(readTempConfig().cities).toEqual([ottawa]);
    expect(output()).toContain("Eliminado: París, Francia");
  });

  test("limpia la ciudad por defecto si era la eliminada", async () => {
    writeTempConfig({ cities: [ottawa, paris], defaultCity: paris });
    mockStdin(["2"]);

    await removeCity();

    expect(readTempConfig().defaultCity).toBeUndefined();
  });

  test("cancela si el número no es válido", async () => {
    mockStdin(["0"]);

    await removeCity();

    expect(readTempConfig().cities).toEqual([ottawa, paris]);
    expect(output()).toContain("Cancelado.");
  });

  test("avisa si no hay ciudades para eliminar", async () => {
    writeTempConfig({ cities: [] });
    mockStdin([]);

    await removeCity();

    expect(output()).toContain("No hay ciudades para eliminar.");
  });
});
