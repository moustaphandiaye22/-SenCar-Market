import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { ManageAdsComponent } from './components/manage-ads/manage-ads.component';
import { ManageTransactionsComponent } from './components/manage-transactions/manage-transactions.component';
import { ManageCertificationsComponent } from './components/manage-certifications/manage-certifications.component';
import { AdminBroadcastComponent } from './components/admin-broadcast/admin-broadcast.component';
import { ManageTradeInComponent } from './components/manage-trade-in/manage-trade-in.component';
import { ManageAvisComponent } from './components/manage-avis/manage-avis.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'users',
    component: ManageUsersComponent
  },
  {
    path: 'ads',
    component: ManageAdsComponent
  },
  {
    path: 'transactions',
    component: ManageTransactionsComponent
  },
  {
    path: 'certifications',
    component: ManageCertificationsComponent
  },
  {
    path: 'broadcast',
    component: AdminBroadcastComponent
  },
  {
    path: 'trade-in',
    component: ManageTradeInComponent
  },
  {
    path: 'avis',
    component: ManageAvisComponent
  }
];
