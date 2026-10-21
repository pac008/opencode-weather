import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { prompt, promptConfirm, promptIndex } from "../../src/presentation/input";

const restores: Array<() => void> = [];

/** Simula lo que el usuario escribe en stdin. */
function mockStdin(data: string): void {
  const writeSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
  const stdinSpy = spyOn(process.stdin, "once").mockImplementation((...args: any[]) => {
    const listener = args[1] as (chunk: Buffer) => void;
    listener(Buffer.from(data));
    return process.stdin;
  });
  restores.push(() => {
    stdinSpy.mockRestore();
    writeSpy.mockRestore();
  });
}

afterEach(() => {
  while (restores.length > 0) restores.pop()?.();
});

describe("prompt", () => {
  test("devuelve el texto escrito sin el salto de línea", async () => {
    mockStdin("Ottawa\n");

    expect(await prompt("Ciudad: ")).toBe("Ottawa");
  });

  test("recorta los espacios sobrantes", async () => {
    mockStdin("  Ottawa  \n");

    expect(await prompt("Ciudad: ")).toBe("Ottawa");
  });

  test("devuelve cadena vacía si el usuario solo pulsa ENTER", async () => {
    mockStdin("\n");

    expect(await prompt("Ciudad: ")).toBe("");
  });

  test("escribe la pregunta en stdout", async () => {
    const writeSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
    const stdinSpy = spyOn(process.stdin, "once").mockImplementation((...args: any[]) => {
      const listener = args[1] as (chunk: Buffer) => void;
      listener(Buffer.from("\n"));
      return process.stdin;
    });

    await prompt("¿Continuar? ");

    expect(writeSpy).toHaveBeenCalledWith("¿Continuar? ");

    stdinSpy.mockRestore();
    writeSpy.mockRestore();
  });
});

describe("promptConfirm", () => {
  test("devuelve true con s", async () => {
    mockStdin("s\n");

    expect(await promptConfirm("¿Agregar? (s/n): ")).toBe(true);
  });

  test("devuelve true con S en mayúsculas", async () => {
    mockStdin("S\n");

    expect(await promptConfirm("¿Agregar? (s/n): ")).toBe(true);
  });

  test("devuelve false con n", async () => {
    mockStdin("n\n");

    expect(await promptConfirm("¿Agregar? (s/n): ")).toBe(false);
  });

  test("devuelve false con una respuesta vacía", async () => {
    mockStdin("\n");

    expect(await promptConfirm("¿Agregar? (s/n): ")).toBe(false);
  });
});

describe("promptIndex", () => {
  test("devuelve el número dentro del rango", async () => {
    mockStdin("2\n");

    expect(await promptIndex("Selecciona: ", 3)).toBe(2);
  });

  test("devuelve null si la respuesta no es numérica", async () => {
    mockStdin("abc\n");

    expect(await promptIndex("Selecciona: ", 3)).toBeNull();
  });

  test("devuelve null si el número es 0", async () => {
    mockStdin("0\n");

    expect(await promptIndex("Selecciona: ", 3)).toBeNull();
  });

  test("devuelve null si el número supera el rango", async () => {
    mockStdin("5\n");

    expect(await promptIndex("Selecciona: ", 3)).toBeNull();
  });

  test("devuelve null si el número es negativo", async () => {
    mockStdin("-1\n");

    expect(await promptIndex("Selecciona: ", 3)).toBeNull();
  });
});
