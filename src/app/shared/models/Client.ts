import { InvoiceDetail } from "./InvoiceDetail";

export interface Client {
  id?: number,
  email: string,
  phone?: string,
  document: string,
  documentType: "RUC" | "DNI",
  rsocial: string,
  createdBy: 'CLIENTE',
  invoiceDetail?: InvoiceDetail
}
