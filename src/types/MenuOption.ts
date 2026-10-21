export type MenuAction =
  | "weather.default"
  | "weather.all"
  | "city.add"
  | "city.remove"
  | "city.setDefault"
  | "settings.toggleUnits"
  | "app.exit";

export interface MenuOption {
  key: string;
  label: string;
  action: MenuAction;
}
