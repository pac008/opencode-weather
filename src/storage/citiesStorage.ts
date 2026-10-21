import type { City } from "../types/City";
import { loadConfig, saveConfig } from "./configStorage";

const SAME_CITY_TOLERANCE = 0.0001;

function isSameCity(a: City, b: City): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < SAME_CITY_TOLERANCE &&
    Math.abs(a.longitude - b.longitude) < SAME_CITY_TOLERANCE
  );
}

export function readCities(): City[] {
  return loadConfig().cities;
}

export function readDefaultCity(): City | undefined {
  return loadConfig().defaultCity;
}

export function insertCity(city: City): boolean {
  const config = loadConfig();
  if (config.cities.some((saved) => isSameCity(saved, city))) return false;
  config.cities.push(city);
  saveConfig(config);
  return true;
}

export function deleteCity(city: City): void {
  const config = loadConfig();
  const index = config.cities.findIndex((saved) => isSameCity(saved, city));
  if (index === -1) return;
  config.cities.splice(index, 1);
  // limpiar default si era la misma
  if (config.defaultCity && isSameCity(config.defaultCity, city)) {
    config.defaultCity = undefined;
  }
  saveConfig(config);
}

export function updateDefaultCity(city: City): void {
  const config = loadConfig();
  config.defaultCity = city;
  saveConfig(config);
}
