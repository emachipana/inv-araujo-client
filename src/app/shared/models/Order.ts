import { Client } from "./Client";
import { Warehouse } from "./Warehouse";

export interface Order {
  id: number,
  client: Client,
  status: "ENTREGADO" | "PENDIENTE",
  location: "ALMACEN" | "AGENCIA",
  total: number,
  department: String,
  city: String,
  date: String,
  maxShipDate: String,
  shippingType: "RECOJO_ALMACEN" | "ENVIO_AGENCIA",
  warehouse?: Warehouse,
}