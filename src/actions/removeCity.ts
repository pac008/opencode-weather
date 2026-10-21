import { promptIndex } from "../presentation/input";
import { showError, showHint, showSuccess } from "../presentation/output";
import { deleteCity, readCities } from "../storage/citiesStorage";
import { cityLabel } from "../utils/format";
import { showCityList } from "./listCities";

export async function removeCity(): Promise<void> {
  const cities = readCities();
  if (cities.length === 0) {
    showError("\nNo hay ciudades para eliminar.");
    return;
  }

  showCityList(cities, "\nCiudades registradas:");

  const index = await promptIndex(
    "Selecciona número a eliminar (0 para cancelar): ",
    cities.length,
  );
  if (index === null) {
    showHint("Cancelado.");
    return;
  }

  const removed = cities[index - 1];
  if (!removed) return;

  deleteCity(removed);
  showSuccess(`Eliminado: ${cityLabel(removed)}`);
}
