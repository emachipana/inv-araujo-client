import { Product } from "./Product";

export interface OrderItem {
  id: number;
  orderId: number;
  product: Product;
  quantity: number;
  subTotal: number;
  price: number;
}
