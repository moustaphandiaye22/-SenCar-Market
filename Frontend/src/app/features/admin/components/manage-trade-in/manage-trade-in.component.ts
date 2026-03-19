import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeInService } from '../../../trade-in/services/trade-in.service';
import { LucideAngularModule, Car, Check, X, Info, Send, ShieldCheck, Clock, Search, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { DemandeTradeIn } from '../../../trade-in/models/trade-in.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PromptService } from '../../../../core/services/prompt.service';

@Component({
  selector: 'app-manage-trade-in',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 relative overflow-hidden">
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>
      <div class="mb-10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 class="text-4xl font-black text-gray-900 tracking-tight">Reprises</h2>
            <p class="text-gray-500 mt-2 font-medium">Gérez les demandes de reprise et de rachat direct.</p>
          </div>
          <div class="relative w-full md:w-72">
            <lucide-angular [img]="icons.Search" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (input)="filterDemandes()"
                   placeholder="Rechercher une demande..." 
                   class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300">
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-primary-600"></div>
      </div>

      <div *ngIf="!isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div *ngFor="let demande of filteredDemandes" 
             class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all duration-200 group">
          
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                    [ngClass]="getStatusClass(demande.statut)">
                {{ demande.statut }}
              </span>
              <span class="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <lucide-angular [img]="icons.Clock" size="12"></lucide-angular>
                {{ demande.dateSoumission | date:'dd MMM yyyy' }}
              </span>
            </div>
            <button (click)="notifier(demande)"
                    class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
              <lucide-angular [img]="icons.Send" size="16"></lucide-angular>
            </button>
          </div>

          <div class="flex gap-6">
            <div class="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-inner">
              <lucide-angular [img]="icons.Car" size="40"></lucide-angular>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                {{ demande.vehiculeActuelDescription || 'Véhicule inconnu' }}
              </h3>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                {{ demande.kilometrageActuel | number }} KM • {{ demande.etatVehicule }}
              </p>
              
              <div class="mt-4 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-[10px] font-black">
                  {{ (demande.utilisateurNom?.[0] || 'U').toUpperCase() }}
                </div>
                <span class="text-xs font-bold text-gray-500 truncate max-w-[150px]">
                  {{ demande.utilisateurNom || demande.utilisateurId }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-2xl p-6 flex justify-between items-center border border-gray-100 group-hover:bg-primary-50/30 transition-colors">
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Estimation</p>
              <p class="text-2xl font-black text-primary-600 tracking-tight">{{ demande.prixEstime | number }} <span class="text-xs">FCFA</span></p>
            </div>
            
            <div class="flex gap-2" *ngIf="demande.statut === 'EN_ATTENTE'">
              <button (click)="valider(demande)"
                      title="Valider la demande"
                      class="w-12 h-12 bg-white text-green-600 border border-green-100 rounded-2xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95">
                <lucide-angular [img]="icons.Check" size="20"></lucide-angular>
              </button>
              <button (click)="rejeter(demande)"
                      title="Rejeter la demande"
                      class="w-12 h-12 bg-white text-red-600 border border-red-100 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95">
                <lucide-angular [img]="icons.X" size="20"></lucide-angular>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && filteredDemandes.length === 0" class="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <lucide-angular [img]="icons.Filter" size="32" class="text-gray-200"></lucide-angular>
        </div>
        <p class="text-gray-400 font-bold uppercase tracking-widest">Aucune demande trouvée</p>
        <p class="text-gray-300 text-sm mt-2">Essayez d'ajuster vos critères de recherche.</p>
      </div>
    </div>
  `
})
export class ManageTradeInComponent implements OnInit {
  private tradeInService = inject(TradeInService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private promptService = inject(PromptService);
  demandes: DemandeTradeIn[] = [];
  filteredDemandes: DemandeTradeIn[] = [];
  searchQuery = '';
  isLoading = true;
  icons = { Car, Check, X, Info, Send, ShieldCheck, Clock, Search, Filter };

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.isLoading = true;
    this.tradeInService.getMesDemandes(0, 50).subscribe({
      next: (res) => {
        this.demandes = res.content;
        this.filterDemandes();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading trade-in requests', err);
        this.isLoading = false;
      }
    });
  }

  filterDemandes() {
    if (!this.searchQuery) {
      this.filteredDemandes = this.demandes;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredDemandes = this.demandes.filter(d => 
        (d.vehiculeActuelDescription && d.vehiculeActuelDescription.toLowerCase().includes(q)) || 
        (d.utilisateurNom && d.utilisateurNom.toLowerCase().includes(q)) ||
        d.utilisateurId.toLowerCase().includes(q)
      );
    }
  }

  valider(demande: DemandeTradeIn) {
    this.confirmService.show({
      title: 'Valider l\'estimation ?',
      message: `Confirmer l'offre de ${new Intl.NumberFormat('fr-FR').format(demande.prixEstime || 0)} FCFA pour ce véhicule ?`,
      confirmText: 'Valider',
      cancelText: 'Annuler',
      onConfirm: () => {
        const valObj = {
          nouveauStatut: 'VALIDEE',
          prixPropose: demande.prixEstime || 0,
          commentaireAdmin: 'Estimation validée par l\'administrateur'
        };
        this.tradeInService.validerDemande(demande.id, valObj).subscribe(() => this.loadDemandes());
      }
    });
  }

  rejeter(demande: DemandeTradeIn) {
    this.promptService.show({
      title: 'Rejeter la demande',
      message: 'Veuillez indiquer une raison pour ce rejet (facultatif).',
      placeholder: 'Raison du rejet...',
      onConfirm: (reason) => {
        this.tradeInService.updateStatut(demande.id, 'REJETEE').subscribe(() => this.loadDemandes());
      }
    });
  }

  notifier(demande: DemandeTradeIn) {
    this.tradeInService.notifierUtilisateur(demande.id).subscribe({
      next: () => this.toastService.success('Rappel envoyé au vendeur !'),
      error: () => this.toastService.error('Erreur lors de l\'envoi de la notification')
    });
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'VALIDEE': return 'bg-green-50 text-green-600';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-600';
      case 'REJETEE': return 'bg-red-50 text-red-600';
      case 'TERMINEE': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  }
}
