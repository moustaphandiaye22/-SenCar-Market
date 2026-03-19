import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbonnementService, PlanAbonnement, UtilisateurAbonnement } from '../../services/abonnement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
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
  private toastService = inject(ToastService);

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

  private router = inject(Router);

  subscribe(plan: PlanAbonnement) {
    if (this.currentSub?.abonnementId === plan.id) return;

    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.abonnementService.subscribe({ 
      utilisateurId: user.id,
      abonnementId: plan.id 
    }).subscribe({
      next: () => {
        this.toastService.success('Souscription réussie !');
        this.router.navigate(['/abonnements/historique']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Erreur lors de la souscription. Vérifiez votre solde.');
      }
    });
  }
}
