import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistrationGuard {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const registerWithGoogle = localStorage.getItem('registerWithGoogle');
    const validateCodeId = localStorage.getItem('validateCodeId');
    
    if(registerWithGoogle) return true;
    
    if (!validateCodeId) {
      this.router.navigate(['/']);
      return false;
    }

    if (validateCodeId && !this.authService.currentUser$.value) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}

export const registrationGuard: CanActivateFn = (route, state) => {
  return inject(RegistrationGuard).canActivate(route, state);
};
