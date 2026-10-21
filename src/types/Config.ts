import type { City } from "./City";
import type { Units } from "./Weather";

export interface Config {
  defaultCity?: City;
  cities: City[];
  units: Units;
}
