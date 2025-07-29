export interface CancelOrderRequest {
  id: number;
  orderId: number;
  reason: string;
  accepted: boolean;
  rejected: boolean;
  createdAt: string;
  updatedAt: string;
}
