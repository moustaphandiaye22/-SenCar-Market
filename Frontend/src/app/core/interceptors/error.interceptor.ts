import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized - Tentative de refresh token
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const token = authService.getToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(clonedReq);
          }),
          catchError((err) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }

      // 403 Forbidden - Pas autorisé
      if (error.status === 403) {
        // Rediriger ou afficher une alerte
      }

      return throwError(() => error);
    })
  );
};
