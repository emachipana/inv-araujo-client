import { BannerItem } from "./BannerItem";

export interface Banner {
  id: number,
  title: string,
  description: string,
  markedWord: string,
  items: BannerItem[]
}
