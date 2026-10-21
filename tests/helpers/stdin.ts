import { spyOn } from "bun:test";

const restores: Array<() => void> = [];
let written: string[] = [];

/**
 * Simula lo que el usuario escribe, respondiendo en orden.
 * Las respuestas agotadas devuelven `defaultAnswer`.
 */
export function mockStdin(answers: string[], defaultAnswer = ""): void {
  const queue = [...answers];
  written = [];
  const writeSpy = spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    written.push(String(chunk));
    return true;
  });
  const stdinSpy = spyOn(process.stdin, "once").mockImplementation((...args: any[]) => {
    const listener = args[1] as (chunk: Buffer) => void;
    const answer = queue.length > 0 ? (queue.shift() as string) : defaultAnswer;
    listener(Buffer.from(`${answer}\n`));
    return process.stdin;
  });

  restores.push(() => {
    stdinSpy.mockRestore();
    writeSpy.mockRestore();
  });
}

/** Texto escrito por la aplicación en stdout (preguntas, mensajes). */
export function writtenOutput(): string {
  return written.join("");
}

export function restoreStdin(): void {
  while (restores.length > 0) restores.pop()?.();
}
