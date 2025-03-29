import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ProductCart } from '../../models/ProductCart';
import { DialogModule } from 'primeng/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from "../buttons/button/button.component";
import { CartService } from '../../../services/cart.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [DialogModule, MatIconModule, ButtonComponent, NgClass],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.scss'
})
export class CartModalComponent {
  @Input({required: true}) product: ProductCart | null = {
    id: -1,
    name: "",
    price: -1,
    quantity: -1,
    maxQuantity: 0,
    productId: -1
  };

  _cartService = inject(CartService);
  router = inject(Router);

  onClose(): void {
    this._cartService.cartModalIsOpen = false;
    this._cartService.productOnModal.set(null);
  }

  toCheckout(): void {
    this.router.navigate(['/carrito'], {queryParams: {tab: 'checkout'}});
    this.onClose();
  }
}
