import { inject, Injectable, signal } from '@angular/core';
import { ApiConstants, AppConstants } from '../constants/index.constants';
import { ProductCart } from '../shared/models/ProductCart';
import { BehaviorSubject, map } from 'rxjs';
import { Observable } from 'rxjs';
import { Product } from '../shared/models/Product';
import { HttpClient } from '@angular/common/http';
import { Pageable } from '../shared/models/Pageable';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items$ = new BehaviorSubject<ProductCart[]>([]);
  productOnModal = signal<ProductCart | null>(null);
  cartModalIsOpen = false;
  private _http = inject(HttpClient);

  constructor() {
    this.loadCart();
  }

  getTotal(items: ProductCart[]): number {
    return items.reduce((acc, cur) => ((cur.discountPrice ?? cur.price) * cur.quantity) + acc, 0)
  }

  private loadCart() {
    const storedItems = JSON.parse(localStorage.getItem(AppConstants.cart_key) || '[]');
    this.items$.next(storedItems);
  }

  private saveCart() {
    localStorage.setItem(AppConstants.cart_key, JSON.stringify(this.items$.value));
  }

  addToCart(product: ProductCart) {
    const currentItems = [...this.items$.value];
    const index = currentItems.findIndex(item => item.id === product.id);

    if (index !== -1) {
      currentItems[index].quantity = product.quantity;
    } else {
      currentItems.push({ ...product });
    }

    this.items$.next(currentItems);
    this.saveCart();
  }

  removeFromCart(productId: number) {
    const updatedItems = this.items$.value.filter(item => item.id !== productId);
    this.items$.next(updatedItems);
    this.saveCart();
  }

  clearCart() {
    this.items$.next([]);
    localStorage.removeItem(AppConstants.cart_key);
  }

  findItemOnCart(id: number): ProductCart | undefined {
    return this.items$.value.find((item) => item.id === id);
  }

  searchProducts(param: string): Observable<Product[]> {
    return this._http.get<Pageable<Product>>(`${ApiConstants.products}/search?param=${param}`).pipe(
      map((response) => response.content)
    );
  }
}
