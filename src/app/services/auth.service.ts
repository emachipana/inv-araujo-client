import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../shared/models/User';
import { AuthRequest } from '../shared/models/AuthRequest';
import { ApiConstants, AppConstants } from '../constants/index.constants';
import { ApiResponse } from '../shared/models/ApiResponse';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Client } from '../shared/models/Client';
import { HotToastService } from '@ngxpert/hot-toast';
import { ClientRequest } from '../shared/models/ClientRequest';
import { ResetResponse } from '../shared/models/ResetResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private toast = inject(HotToastService);
  currentUser$ = new BehaviorSubject<User | null>(null);
  userToValidate: ResetResponse | null = null;
  isLoading = signal(true);
  isLoggedIn = signal(false);

  constructor() {
    // Suscribirse a checkAuth para verificar la autenticación al iniciar
    // pero solo si hay un token presente
    const token = localStorage.getItem(AppConstants.token_key);
    if (token) {
      this.checkAuth().subscribe();
    } else {
      this.isLoading.set(false);
    }
  }

  createClient(request: ClientRequest): Observable<Client> {
    return this._http.post<ApiResponse<Client>>(`${ApiConstants.clients}`, request).pipe(
      map((response) => response.data),
    );
  }

  generateCode(email: String): Observable<ResetResponse> {
    const body = {
      email,
      action: "VALIDATE_EMAIL",
    };

    return this._http.post<ApiResponse<ResetResponse>>(`${ApiConstants.auth}/generate-code`, body).pipe(
      tap((response) => {
        const data: ResetResponse = response.data;

        localStorage.setItem("validateCodeId", data.id.toString());
        localStorage.setItem("emailToValidate", data.email);
        localStorage.removeItem("isCodeValidated");
        this.userToValidate = data;
      }),
      map((response) => response.data)
    );
  }

  validateCode(code: String): Observable<boolean> {
    const validateCodeId = localStorage.getItem("validateCodeId");
    if(!validateCodeId) return of(false);

    const body = {
      resetId: validateCodeId,
      code
    }

    return this._http.post<ApiResponse<{isValid: boolean}>>(`${ApiConstants.auth}/validate-code`, body).pipe(
      map((response) => response.data.isValid)
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

  logout(): void {
    localStorage.removeItem(AppConstants.token_key);
    this.isLoggedIn.set(false);
    this.currentUser$.next(null);
  }

  private authCheck$: Observable<boolean> | null = null;

  checkAuth(): Observable<boolean> {
    // Si ya hay una verificación en curso, la reutilizamos
    if (this.authCheck$) {
      return this.authCheck$;
    }

    const token = localStorage.getItem(AppConstants.token_key);
    if (!token) {
      this.isLoading.set(false);
      this.isLoggedIn.set(false);
      return of(false);
    }

    this.isLoading.set(true);
    
    this.authCheck$ = this._http.get<ApiResponse<User>>(`${ApiConstants.users}/profile/info`).pipe(
      tap({
        next: (response) => {
          this.currentUser$.next(response.data);
          this.isLoggedIn.set(true);
        },
        error: (error) => {
          console.error('Error en checkAuth:', error);
          this.isLoggedIn.set(false);
          // Limpiar token inválido
          localStorage.removeItem(AppConstants.token_key);
        },
        finalize: () => this.isLoading.set(false)
      }),
      map(() => this.isLoggedIn()),
      // Compartir el resultado para futuras suscripciones
      shareReplay(1)
    );

    return this.authCheck$;
  }
}
