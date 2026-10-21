export async function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  const buf = await new Promise<Buffer>((resolve) => {
    process.stdin.once("data", (d: Buffer) => resolve(d));
  });
  return buf.toString("utf-8").replace(/\r?\n$/, "").trim();
}

export async function promptConfirm(question: string): Promise<boolean> {
  const answer = await prompt(question);
  return answer.toLowerCase() === "s";
}

export async function promptIndex(question: string, max: number): Promise<number | null> {
  const answer = await prompt(question);
  const index = Number.parseInt(answer);
  if (Number.isNaN(index) || index < 1 || index > max) return null;
  return index;
}
