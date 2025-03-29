import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../shared/models/Category';
import { ApiConstants } from '../constants/index.constants';
import { forkJoin, map, Observable, retry, switchMap, tap } from 'rxjs';
import { Banner } from '../shared/models/Banner';
import { Product } from '../shared/models/Product';
import { Pageable } from '../shared/models/Pageable';
import { ProductFilters } from '../shared/models/ProductFilters';
import { ApiResponse } from '../shared/models/ApiResponse';
import { Warehouse } from '../shared/models/Warehouse';
import { OrderRequest } from '../shared/models/OrderRequest';
import { Order } from '../shared/models/Order';
import { ProductCart } from '../shared/models/ProductCart';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _http = inject(HttpClient); 
  categories = signal<Category[]>([]);
  products = signal<Pageable<Product>>({content: [], number: 0, pageable: {}, totalElements: 0, totalPages: 0, size: 0});
  discounts = signal<Product[]>([]);
  banners = signal<Banner[]>([]);
  isLoading = signal(false);
  isInfoNavbarVisible = true;
  cachedProducts: { [key: string]: Pageable<Product> } = {};

  controller = {
    categories: false,
    banners: false,
    discounts: false
  }

  createOrder(request: OrderRequest, items: ProductCart[]): Observable<any> {
    return this._http.post<ApiResponse<Order>>(`${ApiConstants.orders}`, request).pipe(
      switchMap((response) => {
        const orderId = response.data.id;
        const itemRequests = items.map(item =>
          this._http.post(`${ApiConstants.orderItems}`, { 
            orderId, 
            productId: item.productId, 
            quantity: item.quantity 
          })
        );

        return forkJoin(itemRequests).pipe(map(() => response.data));
      }),
    );
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this._http.get<Warehouse[]>(`${ApiConstants.warehouses}`);
  }

  getProductById(id: number): Observable<Product> {
    return this._http.get<ApiResponse<Product>>(`${ApiConstants.products}/${id}`).pipe(
      map((response) => response.data),
    );
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

  loadProductsWithDiscounts(size: number = 5): Observable<Pageable<Product>> {
    return this._http.get<Pageable<Product>>(`${ApiConstants.products}?withDiscounts=true&size=${size}`).pipe(
      tap((response) => {
        this.discounts.set(response.content);
        this.controller = {...this.controller, discounts: true};
      })
    );
  }

  getRelatedProducts(productId: number): Observable<Product[]> {
    return this._http.get<Product[]>(`${ApiConstants.products}/${productId}/related`);
  }

  loadProducts(filters: ProductFilters = {minPrice: undefined, maxPrice: undefined, categoryId: undefined, page: 0}): Observable<Pageable<Product>> {
    const url = `${ApiConstants.products}${this.filterBuilder(filters.minPrice, filters.maxPrice, filters.categoryId, filters.page)}`

    console.log(url);

    return this._http.get<Pageable<Product>>(url).pipe(
      tap((response) => {
        this.products.set(response);
      })
    );
  }

  private filterBuilder(minPrice?: number, maxPrice?: number, categoryId?: number, page?: number) {
    let result = "";

    if(categoryId) result += `?categoryId=${categoryId}`;
    
    if(minPrice) {
      const op = categoryId ? "&" : "?";
      result += `${op}minPrice=${minPrice}`;
    } 

    if(maxPrice) {
      const op = (categoryId || minPrice) ? "&" : "?";
      result += `${op}maxPrice=${maxPrice}`;
    }

    if(page) {
      const op = (categoryId || minPrice || maxPrice) ? "&" : "?";
      result += `${op}page=${page}`;
    }

    return result;
  }
}
