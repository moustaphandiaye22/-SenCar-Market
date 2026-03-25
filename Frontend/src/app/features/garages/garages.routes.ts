import { Routes } from '@angular/router';
import { GarageListComponent } from './components/garage-list.component';
import { GarageDetailComponent } from './components/garage-detail.component';
import { GarageFormComponent } from './components/garage-form.component';

export const GARAGE_ROUTES: Routes = [
  {
    path: '',
    component: GarageListComponent
  },
  {
    path: 'new',
    component: GarageFormComponent
  },
  {
    path: ':id',
    component: GarageDetailComponent
  },
  {
    path: ':id/edit',
    component: GarageFormComponent
  }
];
