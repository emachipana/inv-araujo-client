import { Client } from "./Client";
import { Image } from "./Image";
import { Invoice } from "./Invoice";
import { PickupInfo } from "./PickupInfo";
import { ReceiverInfo } from "./ReceiverInfo";
import { Warehouse } from "./Warehouse";

export interface InvitroOrder {
  id: number;
  client: Client;
  status: "ENTREGADO" | "PENDIENTE" | "CANCELADO" | "PAGADO";
  location: "ALMACEN" | "AGENCIA",
  total: number;
  department: string;
  city: string;
  initDate: Date | string;
  finishDate: Date | string;
  totalAdvance: number;
  pending: number;
  shippingType: "RECOJO_ALMACEN" | "ENVIO_AGENCIA";
  warehouse?: Warehouse;
  invoice?: Invoice;
  receiverInfo?: ReceiverInfo;
  pickupInfo?: PickupInfo;
  evidence: Image;
  deliveredAt: Date | string;
  isReady: boolean;
}
