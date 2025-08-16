export type NotiType = "CANCEL_REQUEST_APROVED" | "CANCEL_REQUEST_REJECTED" | "ORDER_DELIVERED" | "VITRO_ORDER_DELIVERED" | "ORDER_AT_AGENCY" | "VITRO_ORDER_AT_AGENCY" | "VITRO_ORDER_ALREADY";

export interface Notification {
  id: number;
  createdAt: Date | string;
  isRead: boolean;
  message: string;
  redirectTo: string;
  type: NotiType;
}
