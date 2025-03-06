import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../shared/models/Category';
import { ApiConstants } from '../constants/index.constants';
import { Observable, tap } from 'rxjs';
import { Banner } from '../shared/models/Banner';
import { Product } from '../shared/models/Product';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _http = inject(HttpClient); 
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  discounts = signal<Product[]>([]);
  banners = signal<Banner[]>([]);
  isLoading = signal(false);
  isInfoNavbarVisible = true;
  controller = {
    categories: false,
    products: false,
    banners: false,
    discounts: false
  }

  loadCategories(): Observable<Category[]> {
    return this._http.get<Category[]>(ApiConstants.categories).pipe(
      tap((response) => {
        this.categories.set(response);
        this.controller = {...this.controller, categories: true};
      })
    );
  }

  loadBanners(): Observable<Banner[]> {
    return this._http.get<Banner[]>(ApiConstants.banners).pipe(
      tap((response) => {
        this.banners.set(response);
        this.controller = {...this.controller, banners: true};
      })
    );
  }

  loadProductsWithDiscounts(): Observable<Product[]> {
    return this._http.get<Product[]>(`${ApiConstants.products}/withDiscounts`).pipe(
      tap((response) => {
        this.discounts.set(response);
        this.controller = {...this.controller, discounts: true};
      })
    );
  }
}
