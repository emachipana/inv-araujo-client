import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/ApiResponse';
import { ApiConstants } from '../constants/index.constants';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private _http = inject(HttpClient);

  createIntent(amount: number): Observable<string> {
    return this._http.post<ApiResponse<string>>(`${ApiConstants.stripe}/create-intent?amount=${amount}`, {}).pipe(
      map((response) => response.data),
    );
  }
}
