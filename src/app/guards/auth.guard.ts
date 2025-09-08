import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginModalService } from '../services/login-modal.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private loginModalService = inject(LoginModalService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.isLoading()) {
      return this.authService.checkAuth().pipe(
        map(isAuthenticated => this.handleAuthCheck(isAuthenticated)),
        catchError(() => of(this.handleAuthCheck(false)))
      );
    }

    if (this.authService.isLoggedIn()) {
      return of(true);
    }
    return of(this.handleAuthCheck(false));
  }

  private handleAuthCheck(isAuthenticated: boolean): boolean {
    if (!isAuthenticated) {
      this.router.navigate(['/']);
      this.loginModalService.open("login");
      this.toast.error("Inicia sesión primero");
      return false;
    }
    return true;
  }
}

export function authGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  return inject(AuthGuard).canActivate(route, state);
}
