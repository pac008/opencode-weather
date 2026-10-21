import { afterEach, describe, expect, test } from "bun:test";
import {
  showCityWeather,
  showCityWeatherError,
  showDefaultCityWeather,
  showDefaultCityWeatherError,
  showError,
  showFoundCity,
  showHint,
  showInfo,
  showSuccess,
} from "../../src/presentation/output";
import type { City } from "../../src/types/City";
import { captureConsole } from "../helpers/captureConsole";

const city: City = {
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
};

let capture = captureConsole();

afterEach(() => {
  capture.restore();
  capture = captureConsole();
});

function lastLine(): string {
  return capture.lines[capture.lines.length - 1] as string;
}

describe("mensajes", () => {
  test("showInfo imprime el texto tal cual", () => {
    showInfo("\nNo hay ciudades registradas.");

    expect(lastLine()).toBe("\nNo hay ciudades registradas.");
  });

  test("showError imprime el mensaje de error", () => {
    showError("No se encontró ninguna ciudad con ese nombre.");

    expect(lastLine()).toBe("No se encontró ninguna ciudad con ese nombre.");
  });

  test("showSuccess imprime el mensaje de éxito", () => {
    showSuccess("Ciudad agregada correctamente.");

    expect(lastLine()).toBe("Ciudad agregada correctamente.");
  });

  test("showHint imprime la pista", () => {
    showHint("Cancelado.");

    expect(lastLine()).toBe("Cancelado.");
  });

  test("showFoundCity muestra la ciudad y sus coordenadas", () => {
    showFoundCity(city);

    expect(lastLine()).toBe("\nEncontrado: Ottawa, Canadá (45.41117, -75.69812)");
  });

  test("showDefaultCityWeather muestra el clima de la ciudad por defecto", () => {
    showDefaultCityWeather(city, 10.7, "°C");

    expect(lastLine()).toBe("\nClima de Ottawa, Canadá: 10.7 °C");
  });

  test("showDefaultCityWeatherError informa del fallo", () => {
    showDefaultCityWeatherError(city);

    expect(lastLine()).toBe("\nNo se pudo obtener el clima de Ottawa, Canadá.");
  });

  test("showCityWeather muestra el clima en formato de lista", () => {
    showCityWeather(city, 10.7, "°C");

    expect(lastLine()).toBe("- Ottawa, Canadá: 10.7 °C");
  });

  test("showCityWeatherError informa del fallo en formato de lista", () => {
    showCityWeatherError(city);

    expect(lastLine()).toBe("- Ottawa, Canadá: Error al obtener clima");
  });
});
