import { Image } from "./Image";

export interface Category {
  id: number,
  name: string,
  description: string,
  image?: Image,
  subcategories: number
}
