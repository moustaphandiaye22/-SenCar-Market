import { Routes } from '@angular/router';

export const VEHICLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/vehicule-list.component').then(m => m.VehiculeListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/vehicule-form.component').then(m => m.VehiculeFormComponent)
  },
  {
    path: 'me',
    loadComponent: () => import('./components/mes-vehicules.component').then(m => m.MesVehiculesComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./components/mes-favoris.component').then(m => m.MesFavorisComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/vehicule-detail.component').then(m => m.VehiculeDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/vehicule-form.component').then(m => m.VehiculeFormComponent)
  }
];
