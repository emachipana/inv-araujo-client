import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, from, map, mergeMap, of, tap, concatMap, toArray } from 'rxjs';

// Models
import { Variety } from '../shared/models/Variety';
import { OrderVariety } from '../shared/models/OrderVariety';
import { AdvanceRequest } from '../shared/models/AdvanceRequest';
import { OrderVarietyRequest } from '../shared/models/OrderVarietyRequest';
import { ApiResponse } from '../shared/models/ApiResponse';
import { InvitroRequest } from '../shared/models/InvitroRequest';
import { InvitroOrder } from '../shared/models/InvitroOrder';
import { AvailableMonth } from '../shared/models/AvailableMonth';

// Constants
import { ApiConstants } from '../constants/index.constants';
import { Advance } from '../shared/models/Advance';
import { ShippingTypeRequest } from '../shared/models/ShippingTypeRequest';
import { ReceiverInfoRequest } from '../shared/models/ReceiverInfoRequest';
import { UpdateReceiverInfoRequest } from '../shared/models/UpdateReceiverInfoRequest';
import { PickupInfoRequest } from '../shared/models/PickupInfoRequest';

const STORAGE_KEY = 'invitro_selected_varieties';
@Injectable({
  providedIn: 'root'
})
export class InvitroService {
  private _http = inject(HttpClient);
  varieties = signal<Variety[]>([]);
  varietiesToOrder$ = new BehaviorSubject<OrderVariety[]>(this.loadFromLocalStorage());

  controller = {
    varieties: false
  }

  constructor() {
    this.varietiesToOrder$.subscribe(varieties => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(varieties));
    });
  }

  private loadFromLocalStorage(): OrderVariety[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from local storage', error);
      return [];
    }
  }

  addShippingType(shippingType: ShippingTypeRequest, orderId: number): Observable<InvitroOrder> {
    return this._http.put<ApiResponse<InvitroOrder>>(`${ApiConstants.invitro}/${orderId}/addShippingType`, shippingType).pipe(
      map(response => response.data)
    );
  }

  registerNewAdvance(advance: AdvanceRequest): Observable<Advance> {
    return this._http.post<ApiResponse<Advance>>(`${ApiConstants.advances}`, advance).pipe(
      map(response => response.data)
    );
  }

  loadVarieties(): Observable<Variety[]> {
    if(this.controller.varieties) return of(this.varieties());

    return this._http.get<{id: number, name: string}[]>(`${ApiConstants.tubers}`).pipe(
      mergeMap(tubers => {
        const varietyRequests = tubers.map(tuber => 
          this._http.get<Variety[]>(`${ApiConstants.varieties}/tuber/${tuber.id}`).pipe(
            map(varieties => 
              varieties.map(variety => ({
                ...variety,
                name: `${tuber.name} ${variety.name}`
              }))
            )
          )
        );
        
        return forkJoin(varietyRequests).pipe(
          map(varietyArrays => ([] as Variety[]).concat(...varietyArrays))
        );
      }),
      tap(varieties => {
        this.varieties.set(varieties);
        this.controller = {...this.controller, varieties: true};
      })
    );
  }

  checkDate(date: string, quantity: number): Observable<AvailableMonth> {
    return this._http.get<ApiResponse<AvailableMonth>>(`${ApiConstants.invitro}/availableByMonth?date=${date}&quantity=${quantity}`).pipe(
      map(response => response.data)
    );
  }

  registerOrder(request: InvitroRequest, varieties: OrderVariety[], advance: number, paymentType: "TARJETA_ONLINE" | "YAPE"): Observable<InvitroOrder> {
    return this._http.post<ApiResponse<InvitroOrder>>(`${ApiConstants.invitro}`, request).pipe(
      mergeMap(orderResponse => {
        const order = orderResponse.data;
        
        // Start notification in background without waiting for it to complete
        this.sendNewOrderNotification(order.id).subscribe({
          error: (err) => console.error('Error sending notification:', err)
        });
        
        return from(varieties).pipe(
          concatMap(variety => {
            const varietyRequest: OrderVarietyRequest = {
              vitroOrderId: order.id,
              varietyId: variety.variety.id,
              price: variety.variety.price,
              quantity: variety.quantity
            };
            
            return this._http.post(`${ApiConstants.orderVariety}`, varietyRequest);
          }),
          toArray(),
          mergeMap(() => {
            const advanceRequest: AdvanceRequest = {
              vitroOrderId: order.id,
              amount: advance,
              paymentType: paymentType
            };
            
            return this._http.post(`${ApiConstants.advances}`, advanceRequest).pipe(
              map(() => order)
            );
          })
        );
      })
    );
  }

  private sendNewOrderNotification(orderId: number): Observable<any> {
    return this._http.post(`${ApiConstants.invitro}/${orderId}/alertNewOrder`, {});
  }

  loadOrder(orderId: number): Observable<InvitroOrder> {
    return this._http.get<ApiResponse<InvitroOrder>>(`${ApiConstants.invitro}/${orderId}`).pipe(
      map(response => response.data)
    );
  }

  loadOrderItems(orderId: number): Observable<OrderVariety[]> {
    return this._http.get<OrderVariety[]>(`${ApiConstants.orderVariety}/vitroOrder/${orderId}`);
  }

  loadAdvances(orderId: number): Observable<Advance[]> {
    return this._http.get<Advance[]>(`${ApiConstants.advances}/vitroOrder/${orderId}`);
  }

  updateReceiverInfo(orderId: number, receiverInfo: UpdateReceiverInfoRequest): Observable<InvitroOrder> {
    return this._http.put<ApiResponse<InvitroOrder>>(`${ApiConstants.invitro}/${orderId}/updateReceiverInfo`, receiverInfo).pipe(
      map(response => response.data)
    );
  }

  updatePickupInfo(orderId: number, pickupInfo: PickupInfoRequest): Observable<InvitroOrder> {
    return this._http.put<ApiResponse<InvitroOrder>>(`${ApiConstants.invitro}/${orderId}/updatePickupInfo`, pickupInfo).pipe(
      map(response => response.data)
    );
  }
}
