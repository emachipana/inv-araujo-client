export interface AdvanceRequest {
  vitroOrderId: number;
  amount: number;
  paymentType: "TARJETA_ONLINE" | "YAPE"
}
