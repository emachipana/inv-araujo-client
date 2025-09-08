export interface Invoice {
  address: string;
  document: string;
  documentType: "DNI" | "RUC";
  id: number;
  invoiceType: "BOLETA" | "FACTURA";
  isSended: boolean;
  issueDate: string;
  pdfUrl: string;
  rsocial: string;
  serie: string;
  total: number;
}
