import { HttpInterceptorFn } from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../../features/auth/auth-service';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const router = inject(Router);
  const accessToken = authService.token()
  if (accessToken){
    req = req.clone(
      {
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
      });
  }
  return next(req).pipe(
    catchError((err) => {
      // console.log(err);
      if (err.status === 401) {
        authService.logout();
        router.navigateByUrl('/login').then();
      }
      return throwError(err);
    })
  );
};
