import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../shared/models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _httpClient = inject(HttpClient);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);


}
