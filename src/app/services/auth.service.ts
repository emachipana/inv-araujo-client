import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../shared/models/User';
import { AuthRequest } from '../shared/models/AuthRequest';
import { ApiConstants, AppConstants } from '../constants/index.constants';
import { ApiResponse } from '../shared/models/ApiResponse';
import { Observable, switchMap, tap } from 'rxjs';
import { Client } from '../shared/models/Client';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private toast = inject(HotToastService);
  currentUser = signal<User | null>(null);
  isLoading = signal(true);
  isLoggedIn = signal(false);

  constructor() {
    this.checkAuth();
  }

  login(credentials: AuthRequest): Observable<ApiResponse<{user: User, token: string}>> {
    return this._http.post<ApiResponse<{user: User, token: string}>>(`${ApiConstants.auth}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(AppConstants.token_key, response.data.token);
          this.isLoggedIn.set(true);
          this.currentUser.set(response.data.user);
        })
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
        this.currentUser.set(response.data.user);
      })
    );
  }

  logout() {
    localStorage.removeItem(AppConstants.token_key);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }

  checkAuth() {
    const token = localStorage.getItem(AppConstants.token_key);
    if(!token) return this.isLoading.set(false);

    this._http.get<ApiResponse<User>>(`${ApiConstants.users}/profile/info`).subscribe({
      next: (response) => {
        this.currentUser.set(response.data);
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
