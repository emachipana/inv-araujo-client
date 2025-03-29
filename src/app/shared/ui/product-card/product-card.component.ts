import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Product } from '../../models/Product';
import { NgClass } from '@angular/common';
import { ButtonComponent } from "../buttons/button/button.component";
import { ProductCart } from '../../models/ProductCart';
import { CartService } from '../../../services/cart.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { mainProductImg } from '../../helpers/main';

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
  toast = inject(HotToastService);
  foundedItem: ProductCart | undefined;
  getImage = mainProductImg;

  ngOnInit(): void {
    this._cartService.items$.subscribe(() => {
      this.foundedItem = this._cartService.findItemOnCart(this.product?.id ?? -1);
    });
  }


  handleClick(): void {
    this.onClick.emit();
  }

  addToCart(): void {
    if(this.product.stock <= 0) {
      this.toast.error("No hay suficiente stock");
      return;
    }

    if(this.foundedItem) return;

    const data: ProductCart = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: 1,
      discountPercentage: this.product.discount?.percentage,
      discountPrice: this.product.discount?.price,
      mainImg: mainProductImg(this.product.images[0]),
      maxQuantity: this.product.stock,
      productId: this.product.id,
    }

    this._cartService.addToCart(data);
    this._cartService.productOnModal.set(data);
    this._cartService.cartModalIsOpen = true;
  }
}
