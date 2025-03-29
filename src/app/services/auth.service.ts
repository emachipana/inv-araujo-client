import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../shared/models/User';
import { AuthRequest } from '../shared/models/AuthRequest';
import { ApiConstants, AppConstants } from '../constants/index.constants';
import { ApiResponse } from '../shared/models/ApiResponse';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { Client } from '../shared/models/Client';
import { HotToastService } from '@ngxpert/hot-toast';
import { ClientRequest } from '../shared/models/ClientRequest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private toast = inject(HotToastService);
  currentUser$ = new BehaviorSubject<User | null>(null);
  isLoading = signal(true);
  isLoggedIn = signal(false);

  constructor() {
    this.checkAuth();
  }

  createClient(request: ClientRequest): Observable<Client> {
    return this._http.post<ApiResponse<Client>>(`${ApiConstants.clients}`, request).pipe(
      map((response) => response.data),
    );
  }

  registerNewClient(clientId: number, password: String): Observable<ApiResponse<{user: User, token: string}>> {
    const userBody = { clientId, password };

    return this._http.post<ApiResponse<{ user: User, token: string }>>(`${ApiConstants.auth}/register`, userBody).pipe(
      tap((response) => {
        localStorage.setItem(AppConstants.token_key, response.data.token);
        this.isLoggedIn.set(true);
        this.currentUser$.next(response.data.user);
      })
    );
  }

  login(credentials: AuthRequest): Observable<ApiResponse<{user: User, token: string}>> {
    return this._http.post<ApiResponse<{user: User, token: string}>>(`${ApiConstants.auth}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(AppConstants.token_key, response.data.token);
          this.isLoggedIn.set(true);
          this.currentUser$.next(response.data.user);
        })
      );
  }

  getClientById(clientId: number): Observable<Client> {
    return this._http.get<ApiResponse<Client>>(`${ApiConstants.clients}/${clientId}`).pipe(
      map((response) => response.data),
    );
  }

  register(request: AuthRequest): Observable<ApiResponse<{user: User, token: string}>> {
    const clientBody: Client = {
      rsocial: "Usuario nuevo",
      createdBy: "CLIENTE",
      documentType: "DNI",
      email: request.username,
    };

    // check email before create client
    // https://api.hunter.io/v2/email-verifier

    return this._http.post<ApiResponse<Client>>(ApiConstants.clients, clientBody).pipe(
      switchMap((response) => {
        const clientId = response.data.id;
        const userBody = { password: request.password, clientId };
        return this._http.post<ApiResponse<{ user: User, token: string }>>(`${ApiConstants.auth}/register`, userBody);
      })
    ).pipe(
      tap((response) => {
        localStorage.setItem(AppConstants.token_key, response.data.token);
        this.isLoggedIn.set(true);
        this.currentUser$.next(response.data.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(AppConstants.token_key);
    this.isLoggedIn.set(false);
    this.currentUser$.next(null);
  }

  checkAuth(): void {
    const token = localStorage.getItem(AppConstants.token_key);
    if(!token) return this.isLoading.set(false);

    this._http.get<ApiResponse<User>>(`${ApiConstants.users}/profile/info`).subscribe({
      next: (response) => {
        this.currentUser$.next(response.data);
        this.isLoggedIn.set(true);
        this.isLoading.set(false)
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toast.error(error.error.message);
        console.log(error);
      }
    });
  }
}
