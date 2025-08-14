import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../shared/models/Order';
import { Pageable } from '../shared/models/Pageable';
import { Observable, tap, switchMap, of } from 'rxjs';
import { ApiConstants } from '../constants/index.constants';
import { AuthService } from './auth.service';
import { InvitroOrder } from '../shared/models/InvitroOrder';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private _http = inject(HttpClient);
  private _authService = inject(AuthService);
  
  orders = signal<Order[]>([]);
  cachedOrders: { [key: string]: Pageable<Order> } = {};
  vitroOrders = signal<InvitroOrder[]>([]);
  cachedVitroOrders: { [key: string]: Pageable<InvitroOrder> } = {};

  loadOrders(page: number = 0, size: number = 10): Observable<Pageable<Order>> {
    const cacheKey = `${page}-${size}`;
    
    // Return cached data if available
    if (this.cachedOrders[cacheKey]) {
      this.orders.set(this.cachedOrders[cacheKey].content);
      return new Observable(observer => {
        observer.next(this.cachedOrders[cacheKey]);
        observer.complete();
      });
    }

    // Get client ID from AuthService
    return this._authService.currentClient$.pipe(
      switchMap(client => {
        if (!client || !client.id) {
          return of({ 
            content: [], 
            totalElements: 0, 
            totalPages: 0, 
            size, 
            number: page,
            pageable: {}
          } as Pageable<Order>);
        }

        // If not in cache, fetch from API with clientId filter
        return this._http.get<Pageable<Order>>(
          `${ApiConstants.orders}?clientId=${client.id}&page=${page}&size=${size}`
        ).pipe(
          tap(response => {
            // Update cache
            this.cachedOrders[cacheKey] = response;
            // Update the signal with the new orders
            this.orders.set(response.content);
          })
        );
      })
    );
  }
}
