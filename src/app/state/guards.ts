import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from './store';

/** Prototype guard. The real API also refuses every request without a valid session. */
export const customerGuard: CanActivateFn = (_r, state) => {
  const store = inject(Store);
  return store.customer() ? true : inject(Router).createUrlTree(['/login'], { queryParams: { next: state.url } });
};
