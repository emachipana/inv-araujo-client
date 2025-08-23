import { Variety } from "./Variety";

export interface OrderVariety {
  id: number;
  quantity: number;
  price: number;
  subTotal?: number;
  variety: Variety;
}
