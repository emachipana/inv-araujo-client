import { Discount } from "./Discount";
import { Image } from "./Image";

export interface Product {
  id: number,
  name: string,
  description: string,
  brand: string,
  unit: string,
  price: number,
  stock: number,
  categoryId: number,
  categoryName: string,
  images: Image[],
  discount: Discount | null
}
