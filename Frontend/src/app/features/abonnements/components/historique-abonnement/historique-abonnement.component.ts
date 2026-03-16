import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbonnementService, UtilisateurAbonnement } from '../../services/abonnement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, Calendar, Clock, CheckCircle2, AlertCircle, History, Package } from 'lucide-angular';

@Component({
  selector: 'app-historique-abonnement',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './historique-abonnement.component.html'
})
export class HistoriqueAbonnementComponent implements OnInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);

  history: UtilisateurAbonnement[] = [];
  isLoading = true;
  icons = { Calendar, Clock, CheckCircle2, AlertCircle, History, Package };

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.loadHistory(user.id);
    }
  }

  loadHistory(userId: string) {
    this.abonnementService.getSubscriptionsHistory(userId).subscribe({
      next: (res) => {
        this.history = res.content;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getStatusClass(statut: string): string {
    switch (statut.toUpperCase()) {
      case 'ACTIF': return 'bg-green-100 text-green-700';
      case 'EXPIRE': return 'bg-gray-100 text-gray-700';
      case 'ANNULE': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  }
}
