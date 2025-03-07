import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../shared/models/Category';
import { ApiConstants } from '../constants/index.constants';
import { Observable, tap } from 'rxjs';
import { Banner } from '../shared/models/Banner';
import { Product } from '../shared/models/Product';
import { Pageable } from '../shared/models/Pageable';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _http = inject(HttpClient); 
  categories = signal<Category[]>([]);
  products = signal<Pageable<Product>>({content: [], number: 0, pageable: {}});
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

  loadProducts(filters = { minPrice: undefined, maxPrice: undefined, categoryName: undefined, page: 0 }): Observable<Pageable<Product>> {
    const url = `${ApiConstants.products}/${this.filterBuilder(filters.minPrice, filters.maxPrice, filters.categoryName, filters.page)}`

    console.log(url);

    return this._http.get<Pageable<Product>>(url).pipe(
      tap((response) => {
        this.products.set(response);
        this.controller = {...this.controller, products: true};
      })
    );
  }

  private filterBuilder(minPrice?: number, maxPrice?: number, categoryName?: string, page?: number) {
    let result = "";

    if(categoryName) result += `?categoryName=${categoryName}`;
    
    if(minPrice) {
      const op = categoryName ? "&" : "?";
      result += `${op}minPrice=${minPrice}`;
    } 

    if(maxPrice) {
      const op = (categoryName || minPrice) ? "&" : "?";
      result += `${op}maxPrice=${maxPrice}`;
    }

    if(page) {
      const op = (categoryName || minPrice || maxPrice) ? "&" : "?";
      result += `${op}page=${page}`;
    }

    return result;
  }
}
