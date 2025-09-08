export interface InvoiceDetail {
  id: number,
  document: string,
  documentType: "DNI" | "RUC",
  rsocial: string,
  address: string,
  invoicePreference: "BOLETA" | "FACTURA"
}
