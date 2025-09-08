import { PickupInfoRequest } from "./PickupInfoRequest";
import { ReceiverInfoRequest } from "./ReceiverInfoRequest";

export interface ShippingTypeRequest {
  shippingType: "ENVIO_AGENCIA" | "RECOJO_ALMACEN";
  department: string;
  city: string;
  receiverInfo?: ReceiverInfoRequest;
  pickupInfo?: PickupInfoRequest;
}
