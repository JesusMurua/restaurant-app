import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { RETURN_URL_KEY, UserRole } from '../models';
import { AuthService } from '../services/auth.service';

/**
 * Role-based route guard.
 *
 * Routes declare allowed roles via route data:
 *   { path: 'pos', canActivate: [authGuard], data: { roles: ['Cashier', 'Owner'] } }
 *
 * If the user is not authenticated → saves the attempted URL and redirects to /pin.
 * If authenticated but wrong role → redirects to /pin.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    localStorage.setItem(RETURN_URL_KEY, route.routeConfig?.path ?? '/');
    return router.createUrlTree(['/pin']);
  }

  const allowedRoles: UserRole[] = route.data['roles'] ?? [];
  const userRole = authService.currentUser()?.role;

  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    return router.createUrlTree(['/pin']);
  }

  return true;
};
