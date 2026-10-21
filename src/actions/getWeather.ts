import { getCurrentTemperature } from "../api/weather";
import { promptConfirm } from "../presentation/input";
import {
  showCityWeather,
  showCityWeatherError,
  showDefaultCityWeather,
  showDefaultCityWeatherError,
  showError,
  showInfo,
} from "../presentation/output";
import { readCities, readDefaultCity } from "../storage/citiesStorage";
import { readUnits } from "../storage/settingsStorage";
import { addCity } from "./addCity";
import { setDefaultCity } from "./setDefaultCity";

export async function getDefaultCityWeather(): Promise<void> {
  const city = readDefaultCity();
  if (!city) {
    showError("\nNo hay ciudad por defecto configurada.");
    const wantsToSet = await promptConfirm("¿Quieres establecerla ahora? (s/n): ");
    if (wantsToSet) await setDefaultCity();
    return;
  }

  const units = readUnits();
  const temperature = await getCurrentTemperature(city, units);
  if (temperature === null) {
    showDefaultCityWeatherError(city);
    return;
  }
  showDefaultCityWeather(city, temperature, units);
}

export async function getAllCitiesWeather(): Promise<void> {
  const cities = readCities();
  if (cities.length === 0) {
    showInfo("\nNo hay ciudades registradas.");
    const wantsToAdd = await promptConfirm("¿Quieres agregar una ciudad? (s/n): ");
    if (wantsToAdd) await addCity();
    return;
  }

  const units = readUnits();
  showInfo("\nClima de todas las ciudades:");
  for (const city of cities) {
    const temperature = await getCurrentTemperature(city, units);
    if (temperature === null) {
      showCityWeatherError(city);
    } else {
      showCityWeather(city, temperature, units);
    }
  }
}
