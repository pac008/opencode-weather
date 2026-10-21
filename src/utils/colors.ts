const USE_COLOR =
  process.env.NO_COLOR == null &&
  process.env.TERM !== "dumb" &&
  Boolean(process.stdout.isTTY);

function colorizer(code: string): (text: string) => string {
  return (text: string): string => (USE_COLOR ? `\x1b[${code}m${text}\x1b[0m` : text);
}

export const c = {
  cyan: colorizer("36"),
  yellow: colorizer("33"),
  green: colorizer("32"),
  red: colorizer("31"),
  dim: colorizer("2"),
};
