import type { City } from "../types/City";
import type { Units } from "../types/Weather";
import { c } from "../utils/colors";
import { cityLabel, formatTemperature } from "../utils/format";

export function showInfo(message: string): void {
  console.log(message);
}

export function showError(message: string): void {
  console.log(c.red(message));
}

export function showSuccess(message: string): void {
  console.log(c.green(message));
}

export function showHint(message: string): void {
  console.log(c.dim(message));
}

export function showFoundCity(city: City): void {
  console.log(
    c.cyan(`\nEncontrado: ${cityLabel(city)} (${city.latitude}, ${city.longitude})`),
  );
}

export function showDefaultCityWeather(city: City, temperature: number, units: Units): void {
  console.log(`\nClima de ${cityLabel(city)}: ${c.yellow(formatTemperature(temperature, units))}`);
}

export function showDefaultCityWeatherError(city: City): void {
  console.log(c.red(`\nNo se pudo obtener el clima de ${cityLabel(city)}.`));
}

export function showCityWeather(city: City, temperature: number, units: Units): void {
  console.log(`- ${cityLabel(city)}: ${c.yellow(formatTemperature(temperature, units))}`);
}

export function showCityWeatherError(city: City): void {
  console.log(`- ${cityLabel(city)}: ${c.red("Error al obtener clima")}`);
}
