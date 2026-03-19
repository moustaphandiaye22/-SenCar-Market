import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementService, Portefeuille } from '../../services/paiement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LucideAngularModule, Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, CreditCard } from 'lucide-angular';

import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-portefeuille',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './portefeuille.component.html'
})
export class PortefeuilleComponent implements OnInit {
  private paiementService = inject(PaiementService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  user$ = this.authService.currentUser$;
  portefeuille?: Portefeuille;
  transactions: any[] = [];
  isLoading = true;
  
  // Modal state
  showRechargeModal = false;
  rechargeAmount = 0;
  isRecharging = false;
  
  icons = { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, CreditCard };

  constructor() {
    this.user$.pipe(
      takeUntilDestroyed(),
      filter(user => !!user)
    ).subscribe(user => {
      if (user) {
        this.loadPortefeuille(user.id);
        this.loadTransactions(user.id);
      }
    });
  }

  ngOnInit() {
  }

  loadPortefeuille(userId: string) {
    this.paiementService.getPortefeuille(userId).subscribe({
      next: (res) => {
        this.portefeuille = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadTransactions(userId: string) {
    this.paiementService.getTransactions(userId).subscribe({
      next: (res) => {
        this.transactions = res;
      }
    });
  }

  recharge() {
    if (this.rechargeAmount <= 0) return;
    
    this.isRecharging = true;
    const user = this.authService.getUser();
    if (!user) return;

    // Simulate a successful recharge via Wave/OM
    // In real scenario, we'd call paiementService.createPaiementWave
    this.paiementService.createPaiement({
      montant: this.rechargeAmount,
      methodePaiement: 'WAVE',
      reservationId: undefined
    }).subscribe({
      next: () => {
        // Refresh after recharge
        setTimeout(() => {
          this.loadPortefeuille(user.id);
          this.loadTransactions(user.id);
          this.isRecharging = false;
          this.showRechargeModal = false;
          this.rechargeAmount = 0;
        }, 2000);
      },
      error: (err) => {
        console.error('Recharge failed', err);
        this.isRecharging = false;
        this.toastService.error('Échec de la recharge. Veuillez réessayer.');
      }
    });
  }
}
