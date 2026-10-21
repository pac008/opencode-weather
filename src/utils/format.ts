import type { City } from "../types/City";
import type { Units } from "../types/Weather";

export function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

export function formatTemperature(temperature: number, units: Units): string {
  return `${temperature} ${units}`;
}
