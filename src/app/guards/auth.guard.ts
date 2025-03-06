import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginModalService } from '../services/login-modal.service';

export const AuthGuard: CanActivateFn = () => {
  const _authService = inject(AuthService);
  const _loginModalService = inject(LoginModalService)
  const router = inject(Router);

  if(!_authService.isLoggedIn()) {
    router.navigate(['/']);
    _loginModalService.open("login");
    return false;
  }

  return true;
}
