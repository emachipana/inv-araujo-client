import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { concatMap, map, switchMap, toArray, tap } from 'rxjs/operators';
import { ApiConstants } from '../constants/index.constants';
import { Category } from '../shared/models/Category';
import { Banner } from '../shared/models/Banner';
import { Product } from '../shared/models/Product';
import { Pageable } from '../shared/models/Pageable';
import { ProductFilters } from '../shared/models/ProductFilters';
import { ApiResponse } from '../shared/models/ApiResponse';
import { Warehouse } from '../shared/models/Warehouse';
import { OrderRequest } from '../shared/models/OrderRequest';
import { ProductCart } from '../shared/models/ProductCart';
import { Order } from '../shared/models/Order';
import { OrderItem } from '../shared/models/OrderItem';
import { PickupInfoRequest } from '../shared/models/PickupInfoRequest';
import { UpdateReceiverInfoRequest } from '../shared/models/UpdateReceiverInfoRequest';
import { CancelRequest } from '../shared/models/CancelRequest';
import { CancelOrderRequest } from '../shared/models/CancelOrderRequest';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _http = inject(HttpClient); 
  categories = signal<Category[]>([]);
  products = signal<Pageable<Product>>({content: [], number: 0, pageable: {}, totalElements: 0, totalPages: 0, size: 0});
  discounts = signal<Product[]>([]);
  banners = signal<Banner[]>([]);
  warehouses = signal<Warehouse[]>([]);
  isLoading = signal(false);
  isInfoNavbarVisible = true;
  cachedProducts: { [key: string]: Pageable<Product> } = {};

  controller = {
    categories: false,
    banners: false,
    discounts: false,
    warehouses: false
  }

  createOrder(request: OrderRequest, items: ProductCart[]): Observable<any> {
    return this._http.post<ApiResponse<Order>>(`${ApiConstants.orders}`, request).pipe(
      switchMap((response) => {
        const orderId = response.data.id;
        
        const processItems$ = from(items).pipe(
          concatMap((item: ProductCart) => 
            this._http.post(`${ApiConstants.orderItems}`, {
              orderId,
              productId: item.productId,
              quantity: item.quantity
            })
          ),
          toArray()
        );

        return processItems$.pipe(
          tap(() => {
            this._http.put(
              `${ApiConstants.orders}/${orderId}/status`, 
              { status: "PAGADO", paymentType: "TARJETA_ONLINE" }
            ).pipe(
              switchMap(() => this._http.post(
                `${ApiConstants.orders}/${orderId}/finalize`,
                {}
              ))
            ).subscribe({
              error: (error) => console.error('Error en operaciones de segundo plano:', error)
            });
          }),
          map(() => response.data)
        );
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this._http.get<ApiResponse<Product>>(`${ApiConstants.products}/${id}`).pipe(
      map((response) => response.data),
    );
  }

  loadWarehouses(): Observable<Warehouse[]> {
    return this._http.get<Warehouse[]>(`${ApiConstants.warehouses}`).pipe(
      tap((response) => {
        this.warehouses.set(response);
        this.controller = {...this.controller, warehouses: true};
      })
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
    return this._http.get<Banner[]>(`${ApiConstants.banners}/used`).pipe(
      tap((response) => {
        this.banners.set(response);
        this.controller = {...this.controller, banners: true};
      })
    );
  }

  loadProductsWithDiscounts(size: number = 5): Observable<Pageable<Product>> {
    return this._http.get<Pageable<Product>>(`${ApiConstants.products}?withDiscount=true&size=${size}`).pipe(
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

  getOrderById(orderId: number): Observable<Order> {
    return this._http.get<ApiResponse<Order>>(`${ApiConstants.orders}/${orderId}`).pipe(
      map(response => response.data)
    );
  }

  getProductsByOrderId(orderId: number): Observable<OrderItem[]> {
    return this._http.get<OrderItem[]>(`${ApiConstants.orderItems}/order/${orderId}`);
  }

  getOrders(): Observable<{ success: boolean; data: Order[]; message: string }> {
    return this._http.get<{ success: boolean; data: Order[]; message: string }>(ApiConstants.orders);
  }

  getAvailableHours(date: string, filterPastHours: boolean = true): Observable<string[]> {
    return this._http.get<ApiResponse<{date: string, hours: string[]}>>(`${ApiConstants.orders}/availableHours?date=${date}`).pipe(
      map(response => {
        if (!filterPastHours) return response.data.hours;
        
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        return response.data.hours.filter(hour => {
          if (date !== currentDate) return true;
          
          const [hourValue, minuteValue] = hour.split(':').map(Number);
          return hourValue > currentHour || 
                (hourValue === currentHour && minuteValue >= currentMinutes);
        });
      })
    );
  }

  updatePickupInfo(orderId: number, pickupInfo: PickupInfoRequest): Observable<Order> {
    return this._http.put<ApiResponse<Order>>(`${ApiConstants.orders}/${orderId}/updatePickupInfo`, pickupInfo).pipe(
      map(response => response.data)
    );
  }

  updateReceiverInfo(orderId: number, receiverInfo: UpdateReceiverInfoRequest): Observable<Order> {
    return this._http.put<ApiResponse<Order>>(`${ApiConstants.orders}/${orderId}/updateReceiverInfo`, receiverInfo).pipe(
      map(response => response.data)
    );
  }

  cancelOrderRequest(cancelOrderRequest: CancelRequest): Observable<CancelOrderRequest> {
    return this._http.post<ApiResponse<CancelOrderRequest>>(`${ApiConstants.cancelOrder}`, cancelOrderRequest).pipe(
      map(response => response.data)
    );
  }

  loadCancelRequests(orderId: number): Observable<CancelOrderRequest[]> {
    return this._http.get<CancelOrderRequest[]>(`${ApiConstants.cancelOrder}/order/${orderId}`);
  }
}
