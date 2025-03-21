export interface ProductCart {
  id: number,
  name: string,
  price: number,
  quantity: number,
  discountPercentage?: number,
  discountPrice?: number,
}
