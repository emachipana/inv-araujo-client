import { inject, Injectable, signal, Signal } from '@angular/core';
import { AppConstants } from '../constants/index.constants';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal([]);
  private _http = inject(HttpClient);
  private _auth = inject(AuthService);

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const items = JSON.parse(localStorage.getItem(AppConstants.cart_key) || '[]');
    this.items.set(items);
  }

  clearCart() {
    this.items.set([]);
  }
}
