import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../shared/models/User';
import { LoginRequest } from '../shared/models/LoginRequest';
import { RegisterRequest } from '../shared/models/RegisterRequest';
import { ApiConstants, AppConstants } from '../constants/index.constants';
import { ApiResponse } from '../shared/models/ApiResponse';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http = inject(HttpClient);
  private _spinnerService = inject(NgxSpinnerService);
  currentUser = signal<User | null>(null);
  isLoading = signal(true);
  isLoggedIn = signal(false);

  constructor() {
    this.checkAuth();
    this._spinnerService.show();
  }

  login(credentials: LoginRequest) {

  }

  register(body: RegisterRequest) {

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
        // this.isLoading.set(false);
        console.log(error)
        this.logout();
      }
    });
  }
}
