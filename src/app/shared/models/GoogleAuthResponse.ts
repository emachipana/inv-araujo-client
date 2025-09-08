import { User } from "./User";

export interface GoogleAuthResponse {
  user: User;
  token: string;
  action: string;
  rsocial: string;
  email: string;
}
