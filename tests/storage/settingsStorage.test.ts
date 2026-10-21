import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readUnits, flipUnits } from "../../src/storage/settingsStorage";
import { useTempConfigPath } from "../helpers/tempConfig";

let cleanup: () => void;

beforeEach(() => {
  cleanup = useTempConfigPath();
});

afterEach(() => {
  cleanup();
});

describe("readUnits", () => {
  test("devuelve °C por defecto", () => {
    expect(readUnits()).toBe("°C");
  });

  test("devuelve las unidades guardadas", () => {
    flipUnits();

    expect(readUnits()).toBe("°F");
  });
});

describe("flipUnits", () => {
  test("cambia de °C a °F y lo persiste", () => {
    expect(flipUnits()).toBe("°F");
    expect(readUnits()).toBe("°F");
  });

  test("vuelve de °F a °C", () => {
    flipUnits();

    expect(flipUnits()).toBe("°C");
    expect(readUnits()).toBe("°C");
  });
});
