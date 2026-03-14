import { Routes } from '@angular/router';
import { RentalListComponent } from './components/rental-list.component';
import { RentalDetailComponent } from './components/rental-detail.component';
import { RentalFormComponent } from './components/rental-form.component';

export const RENTAL_ROUTES: Routes = [
  {
    path: '',
    component: RentalListComponent
  },
  {
    path: 'new',
    component: RentalFormComponent
  },
  {
    path: ':id',
    component: RentalDetailComponent
  },
  {
    path: ':id/edit',
    component: RentalFormComponent
  }
];
