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
    // Si ya está cargando, esperamos a que termine
    if (this.authService.isLoading()) {
      return this.authService.checkAuth().pipe(
        map(isAuthenticated => this.handleAuthCheck(isAuthenticated)),
        // Si hay un error, permitir la navegación pero redirigir al inicio
        catchError(() => of(this.handleAuthCheck(false)))
      );
    }

    // Si no está cargando, verificar el estado actual
    if (this.authService.isLoggedIn()) {
      return of(true);
    }

    // Si no está autenticado, redirigir
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

// Función de guardia para usar en las rutas
export function authGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  return inject(AuthGuard).canActivate(route, state);
}
