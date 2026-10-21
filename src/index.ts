import { addCity } from "./actions/addCity";
import { getAllCitiesWeather, getDefaultCityWeather } from "./actions/getWeather";
import { removeCity } from "./actions/removeCity";
import { setDefaultCity } from "./actions/setDefaultCity";
import { toggleUnits } from "./actions/toggleUnits";
import { prompt } from "./presentation/input";
import { buildMenuOptions, renderMenu } from "./presentation/menu";
import { showError, showSuccess } from "./presentation/output";
import { readCities } from "./storage/citiesStorage";
import { readUnits } from "./storage/settingsStorage";
import type { MenuAction, MenuOption } from "./types/MenuOption";

type RunnableAction = Exclude<MenuAction, "app.exit">;

const ACTIONS: Record<RunnableAction, () => Promise<void>> = {
  "weather.default": getDefaultCityWeather,
  "weather.all": getAllCitiesWeather,
  "city.add": addCity,
  "city.remove": removeCity,
  "city.setDefault": setDefaultCity,
  "settings.toggleUnits": toggleUnits,
};

function findOption(options: MenuOption[], key: string): MenuOption | undefined {
  return options.find((option) => option.key === key);
}

export async function main(): Promise<void> {
  process.stdin.setEncoding("utf-8");

  let running = true;
  while (running) {
    const options = buildMenuOptions({
      citiesCount: readCities().length,
      units: readUnits(),
    });
    renderMenu(options);

    const choice = await prompt("  Selecciona una opción: ");
    console.log();

    const option = findOption(options, choice);
    if (!option) {
      showError("Opción inválida. Intenta de nuevo.");
    } else if (option.action === "app.exit") {
      running = false;
      showSuccess("¡Hasta luego!");
    } else {
      await ACTIONS[option.action]();
    }

    if (running) {
      await prompt("\nPresiona ENTER para volver al menú...");
      console.clear();
    }
  }

  process.stdin.pause();
}

if (import.meta.main) {
  await main();
}
