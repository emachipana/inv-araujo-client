import { Image } from "./Image";

export interface User {
  id: number,
  role: string,
  fullName: string,
  username: string,
  image: Image | null,
  isVerified: boolean,
  clientId: number,
}
