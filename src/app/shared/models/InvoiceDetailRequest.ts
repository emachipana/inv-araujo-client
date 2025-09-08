export interface InvoiceDetailRequest {
  documentType: "DNI" | "RUC";
  document: string;
  rsocial: string;
  invoicePreference: "BOLETA" | "FACTURA";
  address: string
}
