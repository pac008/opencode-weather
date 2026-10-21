import { spyOn } from "bun:test";

export interface ConsoleCapture {
  lines: string[];
  restore: () => void;
}

/** Captura lo que se imprime por console.log. */
export function captureConsole(): ConsoleCapture {
  const lines: string[] = [];
  const spy = spyOn(console, "log").mockImplementation((...args: any[]) => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  });

  return {
    lines,
    restore: () => spy.mockRestore(),
  };
}
