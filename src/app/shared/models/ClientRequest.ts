export interface ClientRequest {
  email: String,
  city: String,
  department: String,
  phone?: String,
  document: String,
  documentType: "DNI" | "RUC",
  rsocial: String,
  createdBy: "CLIENTE"
}
