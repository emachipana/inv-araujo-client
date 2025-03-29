import { Component, inject, Input } from '@angular/core';
import { QuantityComponent } from "../../../shared/ui/quantity/quantity.component";
import { ProductCart } from '../../../shared/models/ProductCart';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'tr[app-product-item]',
  standalone: true,
  imports: [QuantityComponent, MatIconModule],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  @Input({required: true}) product: ProductCart = {
    id: -1,
    maxQuantity: -1,
    name: "",
    price: -1,
    quantity: -1,
    productId: -1,
  };

  _cartService = inject(CartService);

  onChange(num: number): void {
    if(num <= 0) {
      this._cartService.removeFromCart(this.product.id);
      return;
    }

    const data: ProductCart = {...this.product, quantity: num};

    this._cartService.addToCart(data);
  }
}
