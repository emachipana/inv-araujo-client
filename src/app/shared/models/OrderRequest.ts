export interface OrderRequest {
  clientId: number,
  city: String,
  department: String,
  shippingType: "ENVIO_AGENCIA" | "RECOJO_ALMACEN",
}
