import { Image } from "./Image";

export interface User {
  id: number,
  role: string,
  name: string,
  lastName: string,
  username: string,
  image: Image | null
}
