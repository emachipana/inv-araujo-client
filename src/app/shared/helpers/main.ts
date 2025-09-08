import { ProductImage } from "../models/ProductImage";

export const parseCategory = (name: String): String => name.toLowerCase().split(" ").join("-");

export const mainProductImg = (pimage?: ProductImage): String => {
  if(!pimage?.image) return "/default_product.png";

  return pimage.image.url;
}

export const formattedTime = (timeString: string | undefined): string => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').slice(0, 2).map(Number);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  const minutesFormatted = minutes.toString().padStart(2, '0');
  
  return `${hours12}:${minutesFormatted} ${period}`;
}
