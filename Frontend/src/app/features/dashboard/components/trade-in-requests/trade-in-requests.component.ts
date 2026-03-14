import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeInService } from '../../../trade-in/services/trade-in.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DemandeTradeIn, ValidationTradeInRequest } from '../../../trade-in/models/trade-in.model';
import { LucideAngularModule, RefreshCcw, Info, Eye, Check, X, Bell } from 'lucide-angular';

@Component({
  selector: 'app-trade-in-requests',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './trade-in-requests.component.html'
})
export class TradeInRequestsComponent implements OnInit {
  private tradeInService = inject(TradeInService);
  public authService = inject(AuthService);

  demandes: DemandeTradeIn[] = [];
  isLoading = true;
  icons = { RefreshCcw, Info, Eye, Check, X, Bell };

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.isLoading = true;
    const user = this.authService.currentUserValue;
    
    // Si l'utilisateur est ADMIN ou EXPERT, il peut voir tous les dossiers
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'EXPERT';
    
    const request = isAdmin 
      ? this.tradeInService.getMesDemandes(0, 50) 
      : this.tradeInService.getDemandesByUtilisateur(user?.id || '');

    request.subscribe({
      next: (res: any) => {
        // Le backend retourne soit un PaginatedResponse (content), soit un Array direct
        this.demandes = Array.isArray(res) ? res : (res.content || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement demandes trade-in', err);
        this.isLoading = false;
      }
    });
  }

  updateStatut(id: string, statut: string) {
    this.tradeInService.updateStatut(id, statut).subscribe({
      next: () => this.loadDemandes(),
      error: (err: any) => console.error('Erreur mise à jour statut', err)
    });
  }

  notifierClient(id: string) {
    this.tradeInService.notifierUtilisateur(id).subscribe({
      next: () => {
        alert('Notification envoyée au client avec succès.');
        this.loadDemandes();
      },
      error: (err: any) => console.error('Erreur notification', err)
    });
  }

  validerDemande(id: string) {
    const offre = prompt("Quel est le montant de l'offre finale (en CFA) ?");
    if (offre && !isNaN(Number(offre))) {
      const request: ValidationTradeInRequest = {
        nouveauStatut: 'OFFRE_PROPOSEE',
        prixPropose: Number(offre)
      };
      this.tradeInService.validerDemande(id, request).subscribe({
        next: () => this.loadDemandes(),
        error: (err: any) => console.error('Erreur validation', err)
      });
    }
  }
}
