export type Units = "°C" | "°F";

export interface ForecastResponse {
  current: {
    temperature_2m: number;
    time?: string;
  };
  current_units?: {
    temperature_2m: string;
  };
}
