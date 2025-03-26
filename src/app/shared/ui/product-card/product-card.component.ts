import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Image } from '../../models/Image';
import { Product } from '../../models/Product';
import { ProductImage } from '../../models/ProductImage';
import { NgClass } from '@angular/common';
import { ButtonComponent } from "../buttons/button/button.component";
import { ProductCart } from '../../models/ProductCart';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'product-card',
  standalone: true,
  imports: [NgClass, ButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit {
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

  _cartService = inject(CartService);
  foundedItem: ProductCart | undefined;

  ngOnInit(): void {
    this._cartService.items$.subscribe(() => {
      this.foundedItem = this._cartService.findItemOnCart(this.product?.id ?? -1);
    });
  }

  handleClick(): void {
    this.onClick.emit();
  }

  mainProductImg(pimage: ProductImage): string {
    if(!pimage?.image) return "default_product.png";

    return pimage.image.url;
  }

  addToCart(): void {
    if(this.foundedItem) return;

    const data: ProductCart = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: 1,
      discountPercentage: this.product.discount?.percentage,
      discountPrice: this.product.discount?.price,
      mainImg: this.mainProductImg(this.product.images[0]),
    }

    this._cartService.addToCart(data);
    this._cartService.productOnModal.set(data);
    this._cartService.cartModalIsOpen = true;
  }
}
