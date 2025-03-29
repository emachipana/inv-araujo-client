import { inject, Injectable } from '@angular/core';
import { DocsConstants } from '../constants/index.constants';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SunatService {
  private _http = inject(HttpClient);

  getData = (type: "DNI" | "RUC", doc: string): Observable<any> => {
    const url = `${DocsConstants.index}/${type.toLowerCase()}/${doc}?token=${environment.docs_token}`;
    return this._http.get<any>(url);
  }  
}
