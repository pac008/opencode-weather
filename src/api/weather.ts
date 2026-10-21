import type { City } from "../types/City";
import type { ForecastResponse, Units } from "../types/Weather";
import { FORECAST_API_URL } from "../utils/constants";

export async function getCurrentTemperature(
  city: City,
  units: Units,
): Promise<number | null> {
  const url = new URL(FORECAST_API_URL);
  url.searchParams.set("latitude", city.latitude.toString());
  url.searchParams.set("longitude", city.longitude.toString());
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("temperature_unit", units === "°C" ? "celsius" : "fahrenheit");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as ForecastResponse;
    return data.current?.temperature_2m ?? null;
  } catch {
    return null;
  }
}
