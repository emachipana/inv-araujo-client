import { ProductImage } from "../models/ProductImage";

export const parseCategory = (name: String): String => name.toLowerCase().split(" ").join("-");

export const mainProductImg = (pimage?: ProductImage): String => {
  if(!pimage?.image) return "default_product.png";

  return pimage.image.url;
}
