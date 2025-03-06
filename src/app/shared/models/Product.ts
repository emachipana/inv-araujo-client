import { Discount } from "./Discount";
import { ProductImage } from "./ProductImage";

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
  images: ProductImage[],
  discount: Discount | null
}
