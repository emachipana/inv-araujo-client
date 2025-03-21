import { Injectable, signal } from '@angular/core';
import { AppConstants } from '../constants/index.constants';
import { ProductCart } from '../shared/models/ProductCart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<ProductCart[]>([]);
  // private _http = inject(HttpClient);
  // private _auth = inject(AuthService);

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const storedItems = JSON.parse(localStorage.getItem(AppConstants.cart_key) || '[]');
    this.items.set(storedItems);
  }

  private saveCart() {
    localStorage.setItem(AppConstants.cart_key, JSON.stringify(this.items()));
  }

  addToCart(product: ProductCart) {
    const currentItems = [...this.items()];
    const index = currentItems.findIndex(item => item.id === product.id);

    if (index !== -1) {
      currentItems[index].quantity += product.quantity;
    } else {
      currentItems.push({ ...product });
    }

    this.items.set(currentItems);
    this.saveCart();
  }

  removeFromCart(productId: number) {
    const updatedItems = this.items().filter(item => item.id !== productId);
    this.items.set(updatedItems);
    this.saveCart();
  }

  clearCart() {
    this.items.set([]);
    localStorage.removeItem(AppConstants.cart_key);
  }
}
