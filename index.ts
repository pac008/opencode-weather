import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface City {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

type Units = "°C" | "°F";

interface Config {
  defaultCity?: City;
  cities: City[];
  units: Units;
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    admin1?: string;
  }>;
}

interface ForecastResponse {
  current: {
    temperature_2m: number;
    time?: string;
  };
  current_units?: {
    temperature_2m: string;
  };
}

const CONFIG_PATH = join(homedir(), ".weather-cli.json");

const DEFAULT_CONFIG: Config = {
  cities: [],
  units: "°C",
};

function loadConfig(): Config {
  try {
    if (!existsSync(CONFIG_PATH)) return structuredClone(DEFAULT_CONFIG);
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Config;
    // asegurar valores por defecto
    if (!parsed.cities) parsed.cities = [];
    if (!parsed.units) parsed.units = "°C";
    return parsed;
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

function saveConfig(config: Config): void {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error guardando configuración:", err);
  }
}

async function geocodeCity(name: string): Promise<City | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name.trim());
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as GeocodingResponse;
    const r = data.results?.[0];
    if (!r) return null;
    return {
      name: r.name,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    };
  } catch {
    return null;
  }
}

async function getCurrentTemperature(city: City, units: Units): Promise<number | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
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

function printHeader(): void {
  console.log("═══════════════════════════════════════");
  console.log("         WEATHER CLI");
  console.log("═══════════════════════════════════════");
}

function printMenu(config: Config): void {
  printHeader();
  console.log(`  1. Clima de ciudad default`);
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log(`  3. Buscar y agregar ciudad`);
  console.log(`  4. Eliminar ciudad`);
  console.log(`  5. Establecer ciudad default`);
  console.log(`  8. Ajustes (${config.units})`);
  console.log(`  9. Salir`);
  console.log("═══════════════════════════════════════");
}

async function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  const buf = await new Promise<Buffer>((resolve) => {
    process.stdin.once("data", (d: Buffer) => resolve(d));
  });
  return buf.toString("utf-8").replace(/\r?\n$/, "").trim();
}

function cityLabel(c: City): string {
  return c.country ? `${c.name}, ${c.country}` : c.name;
}

async function actionDefaultCity(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log("\nNo hay ciudad por defecto configurada.");
    const ans = await prompt("¿Quieres establecerla ahora? (s/n): ");
    if (ans.toLowerCase() === "s") {
      await actionSetDefault(config);
    }
    return;
  }

  const temp = await getCurrentTemperature(config.defaultCity, config.units);
  if (temp === null) {
    console.log(`\nNo se pudo obtener el clima de ${cityLabel(config.defaultCity)}.`);
    return;
  }
  console.log(`\nClima de ${cityLabel(config.defaultCity)}: ${temp} ${config.units}`);
}

async function actionAllCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\nNo hay ciudades registradas.");
    const ans = await prompt("¿Quieres agregar una ciudad? (s/n): ");
    if (ans.toLowerCase() === "s") await actionAddCity(config);
    return;
  }

  console.log("\nClima de todas las ciudades:");
  for (const c of config.cities) {
    const temp = await getCurrentTemperature(c, config.units);
    if (temp === null) {
      console.log(`- ${cityLabel(c)}: Error al obtener clima`);
    } else {
      console.log(`- ${cityLabel(c)}: ${temp} ${config.units}`);
    }
  }
}

async function actionAddCity(config: Config): Promise<void> {
  const name = await prompt("Ingresa el nombre de la ciudad: ");
  if (!name) {
    console.log("Nombre vacío. Cancelado.");
    return;
  }

  const found = await geocodeCity(name);
  if (!found) {
    console.log("No se encontró ninguna ciudad con ese nombre.");
    return;
  }

  console.log(`\nEncontrado: ${cityLabel(found)} (${found.latitude}, ${found.longitude})`);
  const confirm = await prompt("¿Agregar esta ciudad? (s/n): ");
  if (confirm.toLowerCase() !== "s") {
    console.log("Cancelado.");
    return;
  }

  // evitar duplicados por lat/lon
  const exists = config.cities.some(
    (c) => Math.abs(c.latitude - found.latitude) < 0.0001 && Math.abs(c.longitude - found.longitude) < 0.0001
  );
  if (exists) {
    console.log("Esta ciudad ya está registrada.");
    return;
  }

  config.cities.push(found);
  saveConfig(config);

  const setDefault = await prompt("¿Establecer como ciudad por defecto? (s/n): ");
  if (setDefault.toLowerCase() === "s") {
    config.defaultCity = found;
    saveConfig(config);
    console.log("Ciudad por defecto establecida.");
  }
  console.log("Ciudad agregada correctamente.");
}

async function actionDeleteCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\nNo hay ciudades para eliminar.");
    return;
  }

  console.log("\nCiudades registradas:");
  config.cities.forEach((c, i) => {
    console.log(`  ${i + 1}. ${cityLabel(c)}`);
  });

  const sel = await prompt("Selecciona número a eliminar (0 para cancelar): ");
  const idx = parseInt(sel);
  if (Number.isNaN(idx) || idx < 1 || idx > config.cities.length) {
    console.log("Cancelado.");
    return;
  }

  const removed = config.cities.splice(idx - 1, 1)[0];
  if (removed) {
    // limpiar default si era la misma
    if (config.defaultCity) {
      const same =
        Math.abs(config.defaultCity.latitude - removed.latitude) < 0.0001 &&
        Math.abs(config.defaultCity.longitude - removed.longitude) < 0.0001;
      if (same) {
        config.defaultCity = undefined;
      }
    }
    saveConfig(config);
    console.log(`Eliminado: ${cityLabel(removed)}`);
  } else {
    saveConfig(config);
  }
}

async function actionSetDefault(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\nNo hay ciudades registradas.");
    const ans = await prompt("¿Quieres agregar una ciudad? (s/n): ");
    if (ans.toLowerCase() === "s") await actionAddCity(config);
    return;
  }

  console.log("\nSelecciona ciudad por defecto:");
  config.cities.forEach((c, i) => {
    console.log(`  ${i + 1}. ${cityLabel(c)}`);
  });

  const sel = await prompt("Selecciona número (0 para cancelar): ");
  const idx = parseInt(sel);
  if (Number.isNaN(idx) || idx < 1 || idx > config.cities.length) {
    console.log("Cancelado.");
    return;
  }

  const selected = config.cities[idx - 1];
  config.defaultCity = selected;
  saveConfig(config);
  if (selected) {
    console.log(`Ciudad por defecto: ${cityLabel(selected)}`);
  }
}

async function actionToggleUnits(config: Config): Promise<void> {
  config.units = config.units === "°C" ? "°F" : "°C";
  saveConfig(config);
  console.log(`\nAjustes cambiados a ${config.units}`);
}

async function main(): Promise<void> {
  const config = loadConfig();
  process.stdin.setEncoding("utf-8");

  let running = true;
  while (running) {
    printMenu(config);
    const opt = await prompt("  Selecciona una opción: ");
    console.log();

    switch (opt) {
      case "1":
        await actionDefaultCity(config);
        break;
      case "2":
        await actionAllCities(config);
        break;
      case "3":
        await actionAddCity(config);
        break;
      case "4":
        await actionDeleteCity(config);
        break;
      case "5":
        await actionSetDefault(config);
        break;
      case "8":
        await actionToggleUnits(config);
        break;
      case "9":
        running = false;
        console.log("¡Hasta luego!");
        break;
      default:
        console.log("Opción inválida. Intenta de nuevo.");
        break;
    }

    if (running) {
      await prompt("\nPresiona ENTER para volver al menú...");
      console.clear();
    }
  }

  process.stdin.pause();
}

main();
