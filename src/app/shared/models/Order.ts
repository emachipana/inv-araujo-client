import { Client } from "./Client";
import { Invoice } from "./Invoice";
import { PickupInfo } from "./PickupInfo";
import { ReceiverInfo } from "./ReceiverInfo";
import { Warehouse } from "./Warehouse";

export interface Order {
  id: number,
  client: Client,
  status: "ENTREGADO" | "PENDIENTE",
  location: "ALMACEN" | "AGENCIA",
  total: number,
  department: String,
  city: String,
  date: Date | string,
  maxShipDate: Date | string,
  shippingType: "RECOJO_ALMACEN" | "ENVIO_AGENCIA",
  warehouse?: Warehouse,
  paymentType: "TARJETA_ONLINE" | "YAPE"
  invoice?: Invoice,
  receiverInfo?: ReceiverInfo,
  pickupInfo?: PickupInfo
}
