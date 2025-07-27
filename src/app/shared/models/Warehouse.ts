export interface Warehouse {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  province: string;
  district: string;
  ref?: string; // Referencia opcional
}
