import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../shared/models/User';
import { AuthRequest } from '../shared/models/AuthRequest';
import { ApiConstants, AppConstants } from '../constants/index.constants';
import { ApiResponse } from '../shared/models/ApiResponse';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Client } from '../shared/models/Client';
import { ClientRequest } from '../shared/models/ClientRequest';
import { ResetResponse } from '../shared/models/ResetResponse';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from '@angular/fire/auth';
import { GoogleAuthResponse } from '../shared/models/GoogleAuthResponse';
import { InvoiceDetailRequest } from '../shared/models/InvoiceDetailRequest';
import { InvoiceDetail } from '../shared/models/InvoiceDetail';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private _auth = inject(Auth);
  
  currentUser$ = new BehaviorSubject<User | null>(null);
  currentClient$ = new BehaviorSubject<Client | null>(null);
  userToValidate: ResetResponse | null = null;
  userGoogle: GoogleAuthResponse | null = null;
  isLoading = signal(true);
  isLoggedIn = signal(false);
  isClientLoaded = signal(false);

  constructor() {
    const token = localStorage.getItem(AppConstants.token_key);
    if (token) {
      this.checkAuth().subscribe();
    } else {
      this.isLoading.set(false);
    }
  }

  getClient(id: number): Observable<Client | null> {
    if(this.isClientLoaded()) return of(this.currentClient$.value);

    if(id === -1) return of(null);

    return this._http.get<ApiResponse<Client>>(`${ApiConstants.clients}/${id}`).pipe(
      tap((response) => {
        this.currentClient$.next(response.data);
        this.isClientLoaded.set(true);
      }),
      map((response) => response.data),
    );
  }

  createClient(request: ClientRequest): Observable<Client> {
    return this._http.post<ApiResponse<Client>>(`${ApiConstants.clients}`, request).pipe(
      switchMap((response: ApiResponse<Client>) => {
        const client = response.data;
        const invoiceDetails = {
          document: request.document,
          documentType: request.documentType,
          rsocial: request.rsocial,
          address: request.address || '-',
          invoicePreference: request.invoicePreference
        };
        
        return this._http.post<ApiResponse<any>>(
          `${ApiConstants.clients}/${client.id}/invoiceDetails`, 
          invoiceDetails
        ).pipe(
          map(() => client)
        );
      })
    );
  }

  updateInvoiceDetail(request: InvoiceDetailRequest, clientId: number, detailId: number): Observable<InvoiceDetail> {
    return this._http.put<ApiResponse<InvoiceDetail>>(`${ApiConstants.clients}/${clientId}/invoiceDetails/${detailId}`, request).pipe(
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

  async logout(): Promise<void> {
    try {
      await signOut(this._auth);
    } catch (error) {
      console.error('Error al cerrar sesión con Firebase:', error);
    } finally {
      localStorage.removeItem(AppConstants.token_key);
      this.isLoggedIn.set(false);
      this.currentUser$.next(null);
      this.currentClient$.next(null);
      this.isClientLoaded.set(false);
    }
  }

  loginWithGoogle(): Promise<ApiResponse<GoogleAuthResponse>> {
    return new Promise((resolve, reject) => {
      signInWithPopup(this._auth, new GoogleAuthProvider())
        .then(async (result) => {
          const token = await result.user.getIdToken();
  
          this._http
            .post<ApiResponse<GoogleAuthResponse>>(
              `${ApiConstants.auth}/google`,
              { token }
            )
            .subscribe({
              next: (response) => {
                if(response.data.action === "register") {
                  this.userGoogle = response.data;
                  localStorage.setItem("registerWithGoogle", "true");
                }else if(response.data.action === "login") {
                  localStorage.setItem(AppConstants.token_key, response.data.token);
                  this.isLoggedIn.set(true);
                  this.currentUser$.next(response.data.user);
                }
                resolve(response);
              },
              error: (err) => reject(err),
            });
        })
        .catch((error) => reject(error));
    });
  }

  registerWithGoogle(clientRequest: ClientRequest): Observable<ApiResponse<{user: User, token: string}>> {
    return this._http.post<ApiResponse<{user: User, token: string}>>(
      `${ApiConstants.auth}/google-register`, 
      { 
        token: this.userGoogle?.token,
        documentType: clientRequest.documentType,
        document: clientRequest.document,
        rsocial: clientRequest.rsocial,
        invoicePreference: clientRequest.invoicePreference,
      }
    ).pipe(
      tap(response => {
        if (response.data) {
          localStorage.setItem(AppConstants.token_key, response.data.token);
          this.isLoggedIn.set(true);
          this.currentUser$.next(response.data.user);
          this.userGoogle = null;
          localStorage.removeItem('registerWithGoogle');
        }
      })
    );
  }

  private authCheck$: Observable<boolean> | null = null;

  checkAuth(): Observable<boolean> {
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
          localStorage.removeItem(AppConstants.token_key);
        },
        finalize: () => this.isLoading.set(false)
      }),
      map(() => this.isLoggedIn()),
      shareReplay(1)
    );

    return this.authCheck$;
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<User> {
    const body = {
      currentPassword,
      newPassword
    }
    
    return this._http.put<ApiResponse<User>>(`${ApiConstants.users}/profile/change-password`, body).pipe(
      map((response) => response.data)
    );
  }
}
