export interface Notification {
  id: number;
  createdAt: Date | string;
  isRead: boolean;
  message: string;
  redirectTo: string;
  type: string;
}
