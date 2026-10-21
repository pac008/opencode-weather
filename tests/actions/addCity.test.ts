import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { addCity } from "../../src/actions/addCity";
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

let cleanup: () => void;
let capture = captureConsole();

beforeEach(() => {
  cleanup = useTempConfigPath();
  writeTempConfig();
  capture.restore();
  capture = captureConsole();
  mockFetch((url) =>
    url.includes("geocoding")
      ? new Response(JSON.stringify({ results: [ottawa] }), { status: 200 })
      : new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }),
  );
});

afterEach(() => {
  cleanup();
  restoreFetch();
  restoreStdin();
});

function output(): string {
  return capture.lines.join("\n");
}

describe("addCity", () => {
  test("guarda la ciudad encontrada", async () => {
    mockStdin(["Ottawa", "s", "n"]);

    await addCity();

    expect(readTempConfig().cities).toEqual([ottawa]);
    expect(output()).toContain("Ciudad agregada correctamente.");
  });

  test("muestra la ciudad encontrada con sus coordenadas", async () => {
    mockStdin(["Ottawa", "s", "n"]);

    await addCity();

    expect(output()).toContain("Encontrado: Ottawa, Canadá (45.41117, -75.69812)");
  });

  test("no guarda nada si el nombre está vacío", async () => {
    mockStdin([""]);

    await addCity();

    expect(readTempConfig().cities).toEqual([]);
    expect(output()).toContain("Nombre vacío. Cancelado.");
  });

  test("informa si no encuentra ninguna ciudad", async () => {
    mockFetch(() => new Response(JSON.stringify({ results: [] }), { status: 200 }));
    mockStdin(["Ciudad Inventada"]);

    await addCity();

    expect(readTempConfig().cities).toEqual([]);
    expect(output()).toContain("No se encontró ninguna ciudad con ese nombre.");
  });

  test("cancela si el usuario no confirma", async () => {
    mockStdin(["Ottawa", "n"]);

    await addCity();

    expect(readTempConfig().cities).toEqual([]);
    expect(output()).toContain("Cancelado.");
  });

  test("avisa si la ciudad ya estaba registrada", async () => {
    mockStdin(["Ottawa", "s", "n"]);
    await addCity();

    capture.restore();
    capture = captureConsole();
    mockStdin(["Ottawa", "s"]);
    await addCity();

    expect(readTempConfig().cities).toHaveLength(1);
    expect(output()).toContain("Esta ciudad ya está registrada.");
  });

  test("establece la ciudad por defecto si el usuario lo pide", async () => {
    mockStdin(["Ottawa", "s", "s"]);

    await addCity();

    expect(readTempConfig().defaultCity).toEqual(ottawa);
    expect(output()).toContain("Ciudad por defecto establecida.");
  });

  test("no establece la ciudad por defecto si el usuario no lo pide", async () => {
    mockStdin(["Ottawa", "s", "n"]);

    await addCity();

    expect(readTempConfig().defaultCity).toBeUndefined();
  });
});
