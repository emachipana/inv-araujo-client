export interface ShippingOption {
  id: string;
  title: string;
  subtitle: string;
  value: "RECOJO_ALMACEN" | "ENVIO_AGENCIA";
  checked?: boolean;
}
