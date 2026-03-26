import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.VEHICLE_ROUTES)
  },
  {
    path: 'garages',
    loadChildren: () => import('./features/garages/garages.routes').then(m => m.GARAGE_ROUTES)
  },
  {
    path: 'reprise',
    loadChildren: () => import('./features/trade-in/trade-in.routes').then(m => m.TRADE_IN_ROUTES)
  },
  {
    path: 'locations',
    loadChildren: () => import('./features/rentals/rentals.routes').then(m => m.RENTAL_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'messages',
    loadChildren: () => import('./features/messagerie/messagerie.routes').then(m => m.MESSAGERIE_ROUTES)
  },
  {
    path: 'abonnements',
    loadChildren: () => import('./features/abonnements/abonnements-routing')
  },
  {
    path: 'assurance',
    loadChildren: () => import('./features/assurance/assurance-routing')
  },
  {
    path: 'paiement',
    loadChildren: () => import('./features/paiement/paiement-routing')
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'certification',
    loadChildren: () => import('./features/certification/certification.routes').then(m => m.CERTIFICATION_ROUTES)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

