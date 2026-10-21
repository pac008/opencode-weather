export interface GeocodingResult {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}
