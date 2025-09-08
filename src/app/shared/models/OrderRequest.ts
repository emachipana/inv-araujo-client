import { ReceiverInfoRequest } from "./ReceiverInfoRequest";
import { PickupInfoRequest } from "./PickupInfoRequest";

export interface OrderRequest {
  clientId: number,
  city: String,
  department: String,
  shippingType: "ENVIO_AGENCIA" | "RECOJO_ALMACEN",
  warehouseId: number | null,
  receiverInfo?: ReceiverInfoRequest,
  pickupInfo?: PickupInfoRequest,
}
