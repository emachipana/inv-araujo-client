export interface UpdateProfileRequest {
  phone: string;
  rsocial: string;
  document: string;
  documentType: "DNI" | "RUC";
}
