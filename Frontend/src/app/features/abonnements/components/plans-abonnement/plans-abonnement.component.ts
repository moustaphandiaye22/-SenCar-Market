import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AbonnementService,
  PlanAbonnement,
  UtilisateurAbonnement,
} from '../../services/abonnement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  TypeAbonnement,
  TypeAbonnementLabels,
} from '../../../../core/models/enums.model';
import {
  LucideAngularModule,
  Check,
  Star,
  Zap,
  Shield,
  Crown,
  Wallet,
  CreditCard,
} from 'lucide-angular';

@Component({
  selector: 'app-plans-abonnement',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './plans-abonnement.component.html',
})
export class PlansAbonnementComponent implements OnInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  plans: PlanAbonnement[] = [];
  currentSub?: UtilisateurAbonnement;
  isLoading = true;
  isProcessingPayment = false;
  selectedPlan?: PlanAbonnement;
  showPaymentModal = false;
  selectedPaymentMethod = 'WAVE';

  icons = { Check, Star, Zap, Shield, Crown, Wallet, CreditCard };

  ngOnInit() {
    this.loadPlans();
    const user = this.authService.getUser();
    if (user) {
      this.abonnementService
        .getActiveSubscription(user.id)
        .subscribe((sub) => (this.currentSub = sub));
    }
  }

  loadPlans() {
    this.abonnementService.getPlans().subscribe({
      next: (res) => {
        this.plans = res;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
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

    // For now, create subscription directly (payment integration coming soon)
    this.isLoading = true;
    this.abonnementService
      .subscribe({
        utilisateurId: user.id,
        abonnementId: plan.id,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Souscription réussie !');
          // Refresh subscription
          this.abonnementService
            .getActiveSubscription(user.id)
            .subscribe((sub) => {
              this.currentSub = sub;
              this.router.navigate(['/abonnements/historique']);
            });
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error(
            'Erreur lors de la souscription: ' +
              (err.error?.message || 'Erreur inconnue'),
          );
        },
      });
  }

  onPaymentMethodSelect(method: string) {
    this.selectedPaymentMethod = method;
  }

  confirmPayment() {
    // Payment integration coming soon - for now just close modal
    this.showPaymentModal = false;
    this.selectedPlan = undefined;
    this.toastService.info('Paiement - Bientôt disponible !');
  }

  cancelPayment() {
    this.showPaymentModal = false;
    this.selectedPlan = undefined;
    this.isProcessingPayment = false;
  }

  getTypeLabel(type: string): string {
    return TypeAbonnementLabels[type as TypeAbonnement] || type;
  }
}
