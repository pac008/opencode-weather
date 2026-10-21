export function shouldUseColor(
  env: Record<string, string | undefined> = process.env,
  isTTY: boolean | undefined = process.stdout.isTTY,
): boolean {
  return env.NO_COLOR == null && env.TERM !== "dumb" && Boolean(isTTY);
}

export function colorize(code: string, text: string, useColor = shouldUseColor()): string {
  return useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
}

function colorizer(code: string): (text: string) => string {
  return (text: string): string => colorize(code, text);
}

export const c = {
  cyan: colorizer("36"),
  yellow: colorizer("33"),
  green: colorizer("32"),
  red: colorizer("31"),
  dim: colorizer("2"),
};
