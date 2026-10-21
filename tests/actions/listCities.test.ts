import { afterEach, describe, expect, test } from "bun:test";
import { showCityList } from "../../src/actions/listCities";
import type { City } from "../../src/types/City";
import { captureConsole } from "../helpers/captureConsole";

const ottawa: City = { name: "Ottawa", country: "Canadá", latitude: 45.41117, longitude: -75.69812 };
const paris: City = { name: "París", country: "Francia", latitude: 48.85341, longitude: 2.3488 };

let capture = captureConsole();

afterEach(() => {
  capture.restore();
  capture = captureConsole();
});

describe("showCityList", () => {
  test("imprime el título y la lista numerada", () => {
    showCityList([ottawa, paris], "\nCiudades registradas:");

    expect(capture.lines[0]).toBe("\nCiudades registradas:");
    expect(capture.lines[1]).toBe("  1. Ottawa, Canadá");
    expect(capture.lines[2]).toBe("  2. París, Francia");
  });

  test("solo imprime el título si no hay ciudades", () => {
    showCityList([], "\nCiudades registradas:");

    expect(capture.lines).toEqual(["\nCiudades registradas:"]);
  });
});
