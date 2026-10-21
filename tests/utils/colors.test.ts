import { describe, expect, test } from "bun:test";
import { c, colorize, shouldUseColor } from "../../src/utils/colors";

describe("colorize", () => {
  test("envuelve el texto con el código ANSI cuando el color está activo", () => {
    expect(colorize("31", "error", true)).toBe("\x1b[31merror\x1b[0m");
  });

  test("devuelve el texto plano cuando el color está desactivado", () => {
    expect(colorize("31", "error", false)).toBe("error");
  });
});

describe("shouldUseColor", () => {
  test("deshabilita el color si está definido NO_COLOR", () => {
    expect(shouldUseColor({ NO_COLOR: "1" }, true)).toBe(false);
  });

  test("deshabilita el color si TERM es dumb", () => {
    expect(shouldUseColor({ TERM: "dumb" }, true)).toBe(false);
  });

  test("deshabilita el color si stdout no es un TTY", () => {
    expect(shouldUseColor({}, false)).toBe(false);
  });

  test("habilita el color en un TTY sin NO_COLOR ni TERM=dumb", () => {
    expect(shouldUseColor({}, true)).toBe(true);
  });
});

describe("paleta", () => {
  test("devuelve texto plano cuando NO_COLOR está definido", () => {
    expect(c.cyan("texto")).toBe("texto");
    expect(c.yellow("texto")).toBe("texto");
    expect(c.green("texto")).toBe("texto");
    expect(c.red("texto")).toBe("texto");
    expect(c.dim("texto")).toBe("texto");
  });
});
