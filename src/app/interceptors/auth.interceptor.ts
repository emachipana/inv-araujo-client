import { HttpInterceptorFn } from '@angular/common/http';
import { AppConstants } from '../constants/index.constants';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AppConstants.token_key);

  // Solo agregar Authorization si es una URL de tu backend
  const isOwnApi = req.url.startsWith('/api') || req.url.includes('http://localhost:8085');

  if (token && isOwnApi) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
