import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  deleteCity,
  insertCity,
  readCities,
  readDefaultCity,
  updateDefaultCity,
} from "../../src/storage/citiesStorage";
import type { City } from "../../src/types/City";
import { useTempConfigPath } from "../helpers/tempConfig";

const ottawa: City = { name: "Ottawa", country: "Canadá", latitude: 45.41117, longitude: -75.69812 };
const paris: City = { name: "París", country: "Francia", latitude: 48.85341, longitude: 2.3488 };

let cleanup: () => void;

beforeEach(() => {
  cleanup = useTempConfigPath();
});

afterEach(() => {
  cleanup();
});

describe("insertCity", () => {
  test("añade la ciudad y la persiste", () => {
    expect(insertCity(ottawa)).toBe(true);

    expect(readCities()).toEqual([ottawa]);
  });

  test("añade varias ciudades distintas", () => {
    insertCity(ottawa);
    insertCity(paris);

    expect(readCities()).toEqual([ottawa, paris]);
  });

  test("rechaza una ciudad ya registrada", () => {
    insertCity(ottawa);

    expect(insertCity(ottawa)).toBe(false);
    expect(readCities()).toHaveLength(1);
  });

  test("rechaza una ciudad con coordenadas casi idénticas", () => {
    insertCity(ottawa);

    const nearby = { ...ottawa, name: "Ottawa (centro)" };

    expect(insertCity(nearby)).toBe(false);
    expect(readCities()).toHaveLength(1);
  });
});

describe("readDefaultCity", () => {
  test("devuelve undefined cuando no hay ciudad por defecto", () => {
    expect(readDefaultCity()).toBeUndefined();
  });

  test("devuelve la ciudad por defecto", () => {
    updateDefaultCity(ottawa);

    expect(readDefaultCity()).toEqual(ottawa);
  });
});

describe("updateDefaultCity", () => {
  test("establece la ciudad por defecto sin tocar la lista", () => {
    insertCity(ottawa);

    updateDefaultCity(ottawa);

    expect(readDefaultCity()).toEqual(ottawa);
    expect(readCities()).toEqual([ottawa]);
  });
});

describe("deleteCity", () => {
  test("elimina la ciudad de la lista", () => {
    insertCity(ottawa);
    insertCity(paris);

    deleteCity(ottawa);

    expect(readCities()).toEqual([paris]);
  });

  test("limpia la ciudad por defecto si era la eliminada", () => {
    insertCity(ottawa);
    updateDefaultCity(ottawa);

    deleteCity(ottawa);

    expect(readDefaultCity()).toBeUndefined();
  });

  test("mantiene la ciudad por defecto si es otra", () => {
    insertCity(ottawa);
    insertCity(paris);
    updateDefaultCity(paris);

    deleteCity(ottawa);

    expect(readDefaultCity()).toEqual(paris);
  });

  test("no hace nada si la ciudad no existe", () => {
    insertCity(ottawa);

    deleteCity(paris);

    expect(readCities()).toEqual([ottawa]);
  });
});
