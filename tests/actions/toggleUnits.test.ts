import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { toggleUnits } from "../../src/actions/toggleUnits";
import { captureConsole } from "../helpers/captureConsole";
import { useTempConfigPath, writeTempConfig, readTempConfig } from "../helpers/tempConfig";

let cleanup: () => void;
let capture = captureConsole();

beforeEach(() => {
  cleanup = useTempConfigPath();
  writeTempConfig();
  capture.restore();
  capture = captureConsole();
});

afterEach(() => {
  cleanup();
});

describe("toggleUnits", () => {
  test("cambia las unidades en la configuración", async () => {
    await toggleUnits();

    expect(readTempConfig().units).toBe("°F");
  });

  test("informa de la nueva unidad", async () => {
    await toggleUnits();

    expect(capture.lines.join("\n")).toContain("Ajustes cambiados a °F");
  });

  test("vuelve a °C si se ejecuta dos veces", async () => {
    await toggleUnits();
    await toggleUnits();

    expect(readTempConfig().units).toBe("°C");
  });
});
