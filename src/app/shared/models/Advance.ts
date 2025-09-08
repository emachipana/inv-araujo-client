export interface Advance {
  id: number;
  amount: number;
  paymentType: "TARJETA_ONLINE" | "YAPE";
  createdAt: string;
}
