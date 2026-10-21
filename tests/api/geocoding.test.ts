import { afterEach, describe, expect, test } from "bun:test";
import { geocodeCity } from "../../src/api/geocoding";
import { mockFetch, mockFetchError, restoreFetch } from "../helpers/fetchMock";

afterEach(restoreFetch);

describe("geocodeCity", () => {
  test("devuelve la ciudad mapeada desde la respuesta", async () => {
    mockFetch(
      () =>
        new Response(
          JSON.stringify({
            results: [
              {
                name: "Ottawa",
                country: "Canadá",
                latitude: 45.41117,
                longitude: -75.69812,
                admin1: "Ontario",
              },
            ],
          }),
          { status: 200 },
        ),
    );

    const city = await geocodeCity("Ottawa");

    expect(city).toEqual({
      name: "Ottawa",
      country: "Canadá",
      latitude: 45.41117,
      longitude: -75.69812,
    });
  });

  test("consulta el geocoding con los parámetros esperados", async () => {
    const urls = mockFetch(() => new Response(JSON.stringify({ results: [] }), { status: 200 }));

    await geocodeCity("  Ottawa  ");

    const params = new URL(urls[0] as string).searchParams;
    expect(params.get("name")).toBe("Ottawa");
    expect(params.get("count")).toBe("1");
    expect(params.get("language")).toBe("es");
    expect(params.get("format")).toBe("json");
  });

  test("devuelve null cuando la API responde con error", async () => {
    mockFetch(() => new Response("error", { status: 500 }));

    expect(await geocodeCity("Ottawa")).toBeNull();
  });

  test("devuelve null cuando no hay resultados", async () => {
    mockFetch(() => new Response(JSON.stringify({ results: [] }), { status: 200 }));

    expect(await geocodeCity("Ciudad Inventada")).toBeNull();
  });

  test("devuelve null cuando la respuesta no trae resultados", async () => {
    mockFetch(() => new Response(JSON.stringify({}), { status: 200 }));

    expect(await geocodeCity("Ottawa")).toBeNull();
  });

  test("devuelve null cuando la red falla", async () => {
    mockFetchError(new Error("sin red"));

    expect(await geocodeCity("Ottawa")).toBeNull();
  });
});
