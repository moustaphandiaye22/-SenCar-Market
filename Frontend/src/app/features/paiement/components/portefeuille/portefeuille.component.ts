import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementService, Portefeuille } from '../../services/paiement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-portefeuille',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './portefeuille.component.html'
})
export class PortefeuilleComponent implements OnInit {
  private paiementService = inject(PaiementService);
  private authService = inject(AuthService);

  user$ = this.authService.currentUser$;
  portefeuille?: Portefeuille;
  transactions: any[] = [];
  isLoading = true;
  
  icons = { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, CreditCard };

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        this.loadPortefeuille(user.id);
        this.loadTransactions(user.id);
      }
    });
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
}
