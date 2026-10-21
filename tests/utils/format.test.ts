import { describe, expect, test } from "bun:test";
import { cityLabel, formatTemperature } from "../../src/utils/format";

describe("cityLabel", () => {
  test("incluye el país cuando existe", () => {
    const city = { name: "Ottawa", country: "Canadá", latitude: 45.4, longitude: -75.7 };
    expect(cityLabel(city)).toBe("Ottawa, Canadá");
  });

  test("omite el país cuando no existe", () => {
    const city = { name: "Ottawa", latitude: 45.4, longitude: -75.7 };
    expect(cityLabel(city)).toBe("Ottawa");
  });
});

describe("formatTemperature", () => {
  test("concatena el valor con las unidades", () => {
    expect(formatTemperature(10.7, "°C")).toBe("10.7 °C");
    expect(formatTemperature(51.3, "°F")).toBe("51.3 °F");
  });
});
