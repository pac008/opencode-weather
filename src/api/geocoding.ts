import type { City } from "../types/City";
import type { GeocodingResponse } from "../types/Geocoding";
import {
  GEOCODING_API_URL,
  GEOCODING_LANGUAGE,
  GEOCODING_RESULT_COUNT,
} from "../utils/constants";

export async function geocodeCity(name: string): Promise<City | null> {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set("name", name.trim());
  url.searchParams.set("count", GEOCODING_RESULT_COUNT);
  url.searchParams.set("language", GEOCODING_LANGUAGE);
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as GeocodingResponse;
    const result = data.results?.[0];
    if (!result) return null;
    return {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch {
    return null;
  }
}
