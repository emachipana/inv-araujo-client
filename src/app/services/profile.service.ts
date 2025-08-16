import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../shared/models/Order';
import { Pageable } from '../shared/models/Pageable';
import { Observable, tap, switchMap, of, map } from 'rxjs';
import { ApiConstants } from '../constants/index.constants';
import { AuthService } from './auth.service';
import { InvitroOrder } from '../shared/models/InvitroOrder';
import { Image } from '../shared/models/Image';
import { ApiResponse } from '../shared/models/ApiResponse';
import { UpdateProfileRequest } from '../shared/models/UpdateProfileRequest';
import { Client } from '../shared/models/Client';
import { User } from '../shared/models/User';
import { InvoiceDetail } from '../shared/models/InvoiceDetail';

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

    if (this.cachedOrders[cacheKey]) {
      this.orders.set(this.cachedOrders[cacheKey].content);
      return new Observable(observer => {
        observer.next(this.cachedOrders[cacheKey]);
        observer.complete();
      });
    }

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

        return this._http.get<Pageable<Order>>(
          `${ApiConstants.orders}?clientId=${client.id}&page=${page}&size=${size}`
        ).pipe(
          tap(response => {
            this.cachedOrders[cacheKey] = response;
            this.orders.set(response.content);
          })
        );
      })
    );
  }

  addImage(file: File): Observable<Image> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    return this._http.post<ApiResponse<Image>>(
      `${ApiConstants.images}`, 
      formData
    ).pipe(
      map((response: ApiResponse<Image>) => response.data)
    );
  }

  updateUser(imageId: number, userId: number): Observable<User> {
    return this._http.put<ApiResponse<User>>(`${ApiConstants.users}/${userId}`, {imageId}).pipe(
      map((response: ApiResponse<User>) => response.data)
    );
  }

  updateProfile(request: UpdateProfileRequest, clientId: number): Observable<Client> {
    return this._http.put<ApiResponse<Client>>(`${ApiConstants.clients}/${clientId}`, request).pipe(
      map((response: ApiResponse<Client>) => response.data)
    );
  }

  updateInvoiceDetail(request: InvoiceDetail, clientId: number): Observable<InvoiceDetail> {
    return this._http.put<ApiResponse<InvoiceDetail>>(`${ApiConstants.clients}/${clientId}/invoiceDetails/${request.id}`, request).pipe(
      map((response: ApiResponse<InvoiceDetail>) => response.data)
    );
  }
}
