import { afterEach, describe, expect, test } from "bun:test";
import { buildMenuOptions, renderMenu } from "../../src/presentation/menu";
import { captureConsole } from "../helpers/captureConsole";

let capture = captureConsole();

afterEach(() => {
  capture.restore();
  capture = captureConsole();
});

describe("buildMenuOptions", () => {
  test("devuelve las opciones con su número y su acción", () => {
    const options = buildMenuOptions({ citiesCount: 0, units: "°C" });

    expect(options).toEqual([
      { key: "1", label: "Clima de ciudad default", action: "weather.default" },
      { key: "2", label: "Clima de todas las ciudades (0)", action: "weather.all" },
      { key: "3", label: "Buscar y agregar ciudad", action: "city.add" },
      { key: "4", label: "Eliminar ciudad", action: "city.remove" },
      { key: "5", label: "Establecer ciudad default", action: "city.setDefault" },
      { key: "8", label: "Ajustes (°C)", action: "settings.toggleUnits" },
      { key: "9", label: "Salir", action: "app.exit" },
    ]);
  });

  test("muestra el número de ciudades y las unidades actuales", () => {
    const options = buildMenuOptions({ citiesCount: 3, units: "°F" });

    expect(options[1]?.label).toBe("Clima de todas las ciudades (3)");
    expect(options[5]?.label).toBe("Ajustes (°F)");
  });
});

describe("renderMenu", () => {
  test("imprime el header, las opciones y el separador", () => {
    renderMenu(buildMenuOptions({ citiesCount: 1, units: "°C" }));

    const output = capture.lines.join("\n");
    expect(output).toContain("WEATHER CLI");
    expect(output).toContain("1. Clima de ciudad default");
    expect(output).toContain("2. Clima de todas las ciudades (1)");
    expect(output).toContain("9. Salir");
  });

  test("envuelve el menú entre separadores", () => {
    renderMenu(buildMenuOptions({ citiesCount: 0, units: "°C" }));

    const separator = "═".repeat(117);
    expect(capture.lines[0]).toBe(separator);
    expect(capture.lines[capture.lines.length - 1]).toBe(separator);
  });
});
