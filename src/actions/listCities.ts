import type { City } from "../types/City";
import { cityLabel } from "../utils/format";

export function showCityList(cities: City[], title: string): void {
  console.log(title);
  cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${cityLabel(city)}`);
  });
}
