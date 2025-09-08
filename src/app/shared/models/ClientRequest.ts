export interface ClientRequest {
  email: String,
  phone?: String,
  document: String,
  documentType: "DNI" | "RUC",
  rsocial: String,
  createdBy: "CLIENTE",
  address?: String,
  invoicePreference: "BOLETA" | "FACTURA"
}
