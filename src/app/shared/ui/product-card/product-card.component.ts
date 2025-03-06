import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Image } from '../../models/Image';
import { Product } from '../../models/Product';
import { ProductImage } from '../../models/ProductImage';
import { NgClass } from '@angular/common';
import { ButtonComponent } from "../buttons/button/button.component";

@Component({
  selector: 'product-card',
  standalone: true,
  imports: [NgClass, ButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({required: true}) product: Product = {
    id: 0,
    name: "",
    brand: "",
    categoryId: 0,
    categoryName: "",
    description: "",
    discount: null,
    images: [],
    price: 0,
    stock: 0,
    unit: ""
  };
  @Output() onClick = new EventEmitter<void>();

  handleClick(): void {
    this.onClick.emit();
  }

  mainProductImg(pimage: ProductImage): string {
    if(!pimage?.image) return "default_product.png";

    return pimage.image.url;
  }
}
