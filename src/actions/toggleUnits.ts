import { showSuccess } from "../presentation/output";
import { flipUnits } from "../storage/settingsStorage";

export async function toggleUnits(): Promise<void> {
  const units = flipUnits();
  showSuccess(`\nAjustes cambiados a ${units}`);
}
