import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const _authService = inject(AuthService);
  const router = inject(Router);

  if(!_authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
}
