import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbonnementService, PlanAbonnement, UtilisateurAbonnement } from '../../services/abonnement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, Check, Star, Zap, Shield, Crown } from 'lucide-angular';

@Component({
  selector: 'app-plans-abonnement',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './plans-abonnement.component.html'
})
export class PlansAbonnementComponent implements OnInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);

  plans: PlanAbonnement[] = [];
  currentSub?: UtilisateurAbonnement;
  isLoading = true;
  
  icons = { Check, Star, Zap, Shield, Crown };

  ngOnInit() {
    this.loadPlans();
    const user = this.authService.getUser();
    if (user) {
      this.abonnementService.getActiveSubscription(user.id).subscribe(sub => this.currentSub = sub);
    }
  }

  loadPlans() {
    this.abonnementService.getPlans().subscribe({
      next: (res) => {
        this.plans = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  subscribe(plan: PlanAbonnement) {
    // Logic to open payment modal or redirect
    console.log('Subscribing to', plan.nom);
  }
}
