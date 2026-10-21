import { geocodeCity } from "../api/geocoding";
import { prompt, promptConfirm } from "../presentation/input";
import { showError, showFoundCity, showHint, showSuccess } from "../presentation/output";
import { insertCity, updateDefaultCity } from "../storage/citiesStorage";

export async function addCity(): Promise<void> {
  const name = await prompt("Ingresa el nombre de la ciudad: ");
  if (!name) {
    showHint("Nombre vacío. Cancelado.");
    return;
  }

  const found = await geocodeCity(name);
  if (!found) {
    showError("No se encontró ninguna ciudad con ese nombre.");
    return;
  }

  showFoundCity(found);
  const confirmed = await promptConfirm("¿Agregar esta ciudad? (s/n): ");
  if (!confirmed) {
    showHint("Cancelado.");
    return;
  }

  if (!insertCity(found)) {
    showError("Esta ciudad ya está registrada.");
    return;
  }

  const setDefault = await promptConfirm("¿Establecer como ciudad por defecto? (s/n): ");
  if (setDefault) {
    updateDefaultCity(found);
    showSuccess("Ciudad por defecto establecida.");
  }
  showSuccess("Ciudad agregada correctamente.");
}
