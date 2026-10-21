import { afterEach, describe, expect, test } from "bun:test";
import { getCurrentTemperature } from "../../src/api/weather";
import type { City } from "../../src/types/City";
import { mockFetch, mockFetchError, restoreFetch } from "../helpers/fetchMock";

const city: City = {
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
};

afterEach(restoreFetch);

describe("getCurrentTemperature", () => {
  test("devuelve la temperatura actual", async () => {
    mockFetch(() => new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }));

    expect(await getCurrentTemperature(city, "°C")).toBe(10.7);
  });

  test("consulta el forecast con las coordenadas y el current", async () => {
    const urls = mockFetch(() => new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }));

    await getCurrentTemperature(city, "°C");

    const params = new URL(urls[0] as string).searchParams;
    expect(params.get("latitude")).toBe("45.41117");
    expect(params.get("longitude")).toBe("-75.69812");
    expect(params.get("current")).toBe("temperature_2m");
  });

  test("usa celsius para las unidades °C y fahrenheit para °F", async () => {
    const celsiusUrls = mockFetch(() => new Response(JSON.stringify({ current: { temperature_2m: 10.7 } }), { status: 200 }));
    await getCurrentTemperature(city, "°C");
    expect(new URL(celsiusUrls[0] as string).searchParams.get("temperature_unit")).toBe("celsius");

    const fahrenheitUrls = mockFetch(() => new Response(JSON.stringify({ current: { temperature_2m: 51.3 } }), { status: 200 }));
    await getCurrentTemperature(city, "°F");
    expect(new URL(fahrenheitUrls[0] as string).searchParams.get("temperature_unit")).toBe("fahrenheit");
  });

  test("devuelve null cuando la API responde con error", async () => {
    mockFetch(() => new Response("{}", { status: 500 }));

    expect(await getCurrentTemperature(city, "°C")).toBeNull();
  });

  test("devuelve null cuando la respuesta no trae temperatura", async () => {
    mockFetch(() => new Response(JSON.stringify({ current: {} }), { status: 200 }));

    expect(await getCurrentTemperature(city, "°C")).toBeNull();
  });

  test("devuelve null cuando la red falla", async () => {
    mockFetchError(new Error("sin red"));

    expect(await getCurrentTemperature(city, "°C")).toBeNull();
  });
});
