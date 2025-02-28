import { HttpInterceptorFn } from '@angular/common/http';
import { AppConstants } from '../constants/index.constants';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AppConstants.token_key);  

  if(token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
