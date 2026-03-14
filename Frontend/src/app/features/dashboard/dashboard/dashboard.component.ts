import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, ShieldCheck, Car, Key, Settings, RefreshCcw, User, Bell } from 'lucide-angular';
import { AdminGaragesComponent, ProServicesComponent, ProReservationsComponent, TradeInRequestsComponent, ProfileComponent, NotificationListComponent } from '../components';
import { take } from 'rxjs';

type Tab = 'garages' | 'services' | 'reservations' | 'tradein' | 'profile' | 'notifications';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule,
    AdminGaragesComponent,
    ProServicesComponent,
    ProReservationsComponent,
    TradeInRequestsComponent,
    ProfileComponent,
    NotificationListComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  user$ = this.authService.currentUser$;
  
  activeTab: Tab = 'reservations';
  icons = { ShieldCheck, Car, Key, Settings, RefreshCcw, User, Bell };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as Tab;
      } else {
        this.user$.pipe(take(1)).subscribe(user => {
          if (user?.role === 'ADMIN') {
            this.activeTab = 'garages';
          } else if (user?.role === 'PROFESSIONNEL') {
            this.activeTab = 'services';
          } else if (user?.role === 'EXPERT') {
            this.activeTab = 'tradein';
          } else {
            this.activeTab = 'reservations';
          }
        });
      }
    });
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
  }
}
