import { Routes } from '@angular/router';
import { PlansAbonnementComponent } from './components/plans-abonnement/plans-abonnement.component';
import { HistoriqueAbonnementComponent } from './components/historique-abonnement/historique-abonnement.component';

export const ABONNEMENT_ROUTES: Routes = [
  {
    path: 'plans',
    component: PlansAbonnementComponent
  },
  {
    path: 'historique',
    component: HistoriqueAbonnementComponent
  }
];
