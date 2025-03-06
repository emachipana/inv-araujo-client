import { environment } from "../../environments/environment";

export const ApiConstants = {
  auth: `${environment.base_uri}/auth`,
  users: `${environment.base_uri}/users`,
  clients: `${environment.base_uri}/clients`,
  categories: `${environment.base_uri}/categories`,
  banners: `${environment.base_uri}/offers`,
  products: `${environment.base_uri}/products`
}

export const AppConstants = {
  token_key: "inversiones-token",
  cart_key: "cart-inversiones"
}

export const Colors = {
  persian: "#00AA95",
  dark: "#292929",
  gray: "#3A4755",
  green: "#32665D",
  smoke: "#F2F3F8",
  orange: "#EC6032",
  white: "#F5F5F5",
  blue: "#4173E6",
  taupe: "#8B8B92",
  platinium: "#E0E0E0",
  red: "#FF4747",
  red_hover: "#FF0A0A",
  persian_hover: "#007A6C",
  dim: "#636369",
  yellow: "#FFB829",
  yellow_hover: "#F5A300",
  emerald: "#00CC76"
}
