import { promptConfirm, promptIndex } from "../presentation/input";
import { showError, showHint, showSuccess } from "../presentation/output";
import { readCities, updateDefaultCity } from "../storage/citiesStorage";
import { cityLabel } from "../utils/format";
import { addCity } from "./addCity";
import { showCityList } from "./listCities";

export async function setDefaultCity(): Promise<void> {
  const cities = readCities();
  if (cities.length === 0) {
    showError("\nNo hay ciudades registradas.");
    const wantsToAdd = await promptConfirm("¿Quieres agregar una ciudad? (s/n): ");
    if (wantsToAdd) await addCity();
    return;
  }

  showCityList(cities, "\nSelecciona ciudad por defecto:");

  const index = await promptIndex("Selecciona número (0 para cancelar): ", cities.length);
  if (index === null) {
    showHint("Cancelado.");
    return;
  }

  const selected = cities[index - 1];
  if (!selected) return;

  updateDefaultCity(selected);
  showSuccess(`Ciudad por defecto: ${cityLabel(selected)}`);
}
