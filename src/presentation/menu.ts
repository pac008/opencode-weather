import type { MenuOption } from "../types/MenuOption";
import type { Units } from "../types/Weather";
import { c } from "../utils/colors";
import { MENU_SEPARATOR } from "../utils/constants";

export interface MenuState {
  citiesCount: number;
  units: Units;
}

export function buildMenuOptions(state: MenuState): MenuOption[] {
  return [
    { key: "1", label: "Clima de ciudad default", action: "weather.default" },
    {
      key: "2",
      label: `Clima de todas las ciudades (${state.citiesCount})`,
      action: "weather.all",
    },
    { key: "3", label: "Buscar y agregar ciudad", action: "city.add" },
    { key: "4", label: "Eliminar ciudad", action: "city.remove" },
    { key: "5", label: "Establecer ciudad default", action: "city.setDefault" },
    { key: "8", label: `Ajustes (${state.units})`, action: "settings.toggleUnits" },
    { key: "9", label: "Salir", action: "app.exit" },
  ];
}

export function renderMenu(options: MenuOption[]): void {
  console.log(MENU_SEPARATOR);
  console.log(c.cyan("         WEATHER CLI"));
  console.log(MENU_SEPARATOR);
  for (const option of options) {
    console.log(c.cyan(`  ${option.key}. ${option.label}`));
  }
  console.log(MENU_SEPARATOR);
}
