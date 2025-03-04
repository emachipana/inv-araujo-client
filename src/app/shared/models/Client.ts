export interface Client {
  id?: number,
  email: string,
  city?: string,
  department?: string,
  phone?: string,
  document?: string,
  documentType: string,
  rsocial: string,
  createdBy: 'CLIENTE' | 'ADMINISTRADOR'
}
