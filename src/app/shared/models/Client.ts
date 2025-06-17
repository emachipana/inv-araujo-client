export interface Client {
  id?: number,
  email: string,
  city?: string,
  department?: string,
  phone?: string,
  document: string,
  documentType: "RUC" | "DNI",
  rsocial: string,
  createdBy: 'CLIENTE' | 'ADMINISTRADOR',
  invoicePreference: "BOLETA" | "FACTURA",
  address?: string
}
