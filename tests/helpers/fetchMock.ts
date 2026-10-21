import { spyOn } from "bun:test";

type FetchHandler = (url: string) => Response | Promise<Response>;

let restore: (() => void) | null = null;

/** Intercepta fetch y devuelve las URLs solicitadas. */
export function mockFetch(handler: FetchHandler): string[] {
  restoreFetch();
  const urls: string[] = [];
  const spy = spyOn(globalThis, "fetch").mockImplementation(((input: string | Request | URL) => {
    const url = String(input);
    urls.push(url);
    return Promise.resolve(handler(url));
  }) as typeof fetch);
  restore = () => spy.mockRestore();
  return urls;
}

/** Intercepta fetch simulando un fallo de red. */
export function mockFetchError(error: Error): void {
  restoreFetch();
  const spy = spyOn(globalThis, "fetch").mockRejectedValue(error);
  restore = () => spy.mockRestore();
}

export function restoreFetch(): void {
  restore?.();
  restore = null;
}
