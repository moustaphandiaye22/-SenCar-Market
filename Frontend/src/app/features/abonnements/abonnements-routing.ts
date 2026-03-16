import { Routes } from '@angular/router';
import { PlansAbonnementComponent } from './components/plans-abonnement/plans-abonnement.component';
import { HistoriqueAbonnementComponent } from './components/historique-abonnement/historique-abonnement.component';

const routes: Routes = [
  {
    path: 'plans',
    component: PlansAbonnementComponent
  },
  {
    path: 'historique',
    component: HistoriqueAbonnementComponent
  }
];

export default routes;
