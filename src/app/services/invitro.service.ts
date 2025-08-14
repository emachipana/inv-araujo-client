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

const STORAGE_KEY = 'invitro_selected_varieties';
@Injectable({
  providedIn: 'root'
})
export class InvitroService {
  private _http = inject(HttpClient);
  varieties = signal<Variety[]>([]);
  varietiesToOrder$ = new BehaviorSubject<OrderVariety[]>(this.loadFromLocalStorage());

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

  controller = {
    varieties: false
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
    // First, register the order
    return this._http.post<ApiResponse<InvitroOrder>>(`${ApiConstants.invitro}`, request).pipe(
      // After order is created, register varieties sequentially
      mergeMap(orderResponse => {
        const order = orderResponse.data;
        
        // Convert varieties array to an observable that processes them sequentially
        return from(varieties).pipe(
          // Process each variety one after another
          concatMap(variety => {
            const varietyRequest: OrderVarietyRequest = {
              vitroOrderId: order.id,
              varietyId: variety.variety.id,
              price: variety.variety.price,
              quantity: variety.quantity
            };
            
            return this._http.post(`${ApiConstants.orderVariety}`, varietyRequest);
          }),
          // Convert to array to know when all are done
          toArray(),
          // After all varieties are registered, register the advance
          mergeMap(() => {
            const advanceRequest: AdvanceRequest = {
              vitroOrderId: order.id,
              amount: advance,
              paymentType: paymentType
            };
            
            // Register the advance and return the original order
            return this._http.post(`${ApiConstants.advances}`, advanceRequest).pipe(
              map(() => order) // Return the original order on success
            );
          })
        );
      })
    );
  }
}
