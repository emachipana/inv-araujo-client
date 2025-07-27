import { environment } from "../../environments/environment";

export const ApiConstants = {
  auth: `${environment.base_uri}/auth`,
  users: `${environment.base_uri}/users`,
  clients: `${environment.base_uri}/clients`,
  categories: `${environment.base_uri}/categories`,
  banners: `${environment.base_uri}/offers`,
  products: `${environment.base_uri}/products`,
  stripe: `${environment.base_uri}/payments`,
  warehouses: `${environment.base_uri}/warehouses`,
  orders: `${environment.base_uri}/orders`,
  orderItems: `${environment.base_uri}/orderProducts`,
  chatbot: `${environment.base_uri}/chatbot/question`
}

export const DocsConstants = {
  index: `${environment.docs_uri}`,
}

export const AppConstants = {
  token_key: "inversiones-token",
  cart_key: "cart-inversiones"
}

export const Colors = {
  dark: "#292929",
  gray: "#3A4755",
  gray_light: "#E9ECEF",
  gray_card_hover: "#D0D6DD",
  green: "#32665D",
  smoke: "#F2F3F8",
  orange: "#EA580C",
  orange_light: "#FFE4CC",
  orange_medium: "#F4712A",
  orange_card_hover: "#FFBE85",
  white: "#F5F5F5",
  blue: "#4173E6",
  blue_light: "#D6E2FF",
  blue_medium: "#5D87EA",
  blue_card_hover: "#99B8FF",
  persian: "#00AA95",
  persian_light: "#D6F2EF",
  persian_card_hover: "#73D3C8",
  persian_medium: "#36AB9D",
  taupe: "#8B8B92",
  platinium: "#E0E0E0",
  red: "#E53E3E",
  red_medium: "#E95D5D",
  red_light: "#FEE2E2",
  red_card_hover: "#FB9D9D",
  red_hover: "#FF0A0A",
  persian_hover: "#007A6C",
  dim: "#636369",
  yellow: "#FFB829",
  yellow_light: "#FFE4A3",
  yellow_card_hover: "#FFD470",
  yellow_hover: "#F5A300",
  emerald: "#00CC76",
  emerald_medium: "#00E083",
  purple: "#7E57C2",
  purple_light: "#E8E1F7",
  purple_card_hover: "#C1AEEA"
}
