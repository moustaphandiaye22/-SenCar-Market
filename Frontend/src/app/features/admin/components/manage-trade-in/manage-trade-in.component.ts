import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeInService } from '../../../trade-in/services/trade-in.service';
import {
  LucideAngularModule,
  Car,
  Check,
  X,
  Info,
  Send,
  ShieldCheck,
  Clock,
  Search,
  Filter,
} from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { DemandeTradeIn } from '../../../trade-in/models/trade-in.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PromptService } from '../../../../core/services/prompt.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-manage-trade-in',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 relative overflow-hidden">
      <div
        class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"
      ></div>
      <div class="mb-10">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h2 class="text-4xl font-black text-gray-900 tracking-tight">
              Reprises
            </h2>
            <p class="text-gray-500 mt-2 font-medium">
              Gérez les demandes de reprise et de rachat direct.
            </p>
          </div>
          <div class="relative w-full md:w-72">
            <lucide-angular
              [img]="icons.Search"
              size="18"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            ></lucide-angular>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterDemandes()"
              placeholder="Rechercher une demande..."
              class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-primary-600"
        ></div>
      </div>

      <div *ngIf="!isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          *ngFor="let demande of filteredDemandes"
          class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all duration-200 group"
        >
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <span
                class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                [ngClass]="getStatusClass(demande.statut)"
              >
                {{ demande.statut }}
              </span>
              <span
                class="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
              >
                <lucide-angular [img]="icons.Clock" size="12"></lucide-angular>
                {{ demande.dateSoumission | date: 'dd MMM yyyy' }}
              </span>
            </div>
            <button
              (click)="notifier(demande)"
              class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            >
              <lucide-angular [img]="icons.Send" size="16"></lucide-angular>
            </button>
          </div>
          <div class="flex gap-6">
            <div
              class="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-inner"
            >
              <img
                *ngIf="demande.photosUrls && demande.photosUrls.length > 0"
                [src]="getImageUrl(demande.photosUrls[0]!)"
                class="w-full h-full object-cover"
              />
              <lucide-angular
                *ngIf="!demande.photosUrls?.length"
                [img]="icons.Car"
                size="40"
              ></lucide-angular>
            </div>
            <div class="flex-1">
              <h3
                class="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors"
              >
                {{ demande.vehiculeActuelDescription || 'Véhicule inconnu' }}
              </h3>
              <p
                class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1"
              >
                {{ demande.kilometrageActuel | number }} KM •
                {{ demande.etatVehicule }}
              </p>

              <div class="mt-4 flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-[10px] font-black"
                >
                  {{ (demande.utilisateurNom?.[0] || 'U').toUpperCase() }}
                </div>
                <span
                  class="text-xs font-bold text-gray-500 truncate max-w-[150px]"
                >
                  {{ demande.utilisateurNom || demande.utilisateurId }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 rounded-2xl p-6 flex justify-between items-center border border-gray-100 group-hover:bg-primary-50/30 transition-colors"
          >
            <div>
              <p
                class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1"
              >
                Estimation
              </p>
              <p class="text-2xl font-black text-primary-600 tracking-tight">
                {{ demande.prixEstime | number }}
                <span class="text-xs">FCFA</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <!-- Bouton Valider / Accepter -->
              <button
                *ngIf="
                  [
                    'EN_ATTENTE',
                    'EN_COURS_EVALUATION',
                    'EVALUATION_TERMINEE',
                    'OFFRE_PROPOSEE',
                    'VALIDEE',
                  ].includes(demande.statut)
                "
                (click)="valider(demande)"
                class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm active:scale-95 font-bold text-xs whitespace-nowrap"
              >
                <lucide-angular [img]="icons.Check" size="16"></lucide-angular>
                <span>Valider l'offre</span>
              </button>

              <!-- Bouton Rejeter -->
              <button
                *ngIf="
                  !['ACCEPTE', 'REJETEE', 'ANNULEE', 'TERMINEE'].includes(
                    demande.statut
                  )
                "
                (click)="rejeter(demande)"
                class="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition shadow-sm active:scale-95 font-bold text-xs whitespace-nowrap"
              >
                <lucide-angular [img]="icons.X" size="16"></lucide-angular>
                <span>Rejeter</span>
              </button>

              <!-- Badge final pour les états terminés -->
              <div
                *ngIf="
                  ['ACCEPTE', 'REJETEE', 'ANNULEE', 'TERMINEE'].includes(
                    demande.statut
                  )
                "
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100"
                [ngClass]="getStatusClass(demande.statut)"
              >
                {{ demande.statut === 'REJETEE' ? 'REJETÉE' : 'FINALISÉ' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="!isLoading && filteredDemandes.length === 0"
        class="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100"
      >
        <div
          class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <lucide-angular
            [img]="icons.Filter"
            size="32"
            class="text-gray-200"
          ></lucide-angular>
        </div>
        <p class="text-gray-400 font-bold uppercase tracking-widest">
          Aucune demande trouvée
        </p>
        <p class="text-gray-300 text-sm mt-2">
          Essayez d'ajuster vos critères de recherche.
        </p>
      </div>
    </div>
  `,
})
export class ManageTradeInComponent implements OnInit {
  private tradeInService = inject(TradeInService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private promptService = inject(PromptService);
  demandes: any[] = [];
  filteredDemandes: DemandeTradeIn[] = [];
  searchQuery = '';
  isLoading = true;
  icons = { Car, Check, X, Info, Send, ShieldCheck, Clock, Search, Filter };

  ngOnInit() {
    this.loadDemandes();
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'assets/placeholder-car.jpg';
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace('/api', '');
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }

  loadDemandes() {
    this.isLoading = true;
    this.tradeInService.getMesDemandes(0, 50).subscribe({
      next: (res: any) => {
        this.demandes =
          res?.content ||
          res?.data?.content ||
          (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
        this.filterDemandes();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading trade-in requests', err);
        this.isLoading = false;
      },
    });
  }

  filterDemandes() {
    if (!this.searchQuery) {
      this.filteredDemandes = this.demandes;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredDemandes = this.demandes.filter(
        (d) =>
          (d.vehiculeActuelDescription &&
            d.vehiculeActuelDescription.toLowerCase().includes(q)) ||
          (d.utilisateurNom && d.utilisateurNom.toLowerCase().includes(q)) ||
          (d.utilisateurId && d.utilisateurId.toLowerCase().includes(q)),
      );
    }
  }

  valider(demande: any) {
    this.confirmService.show({
      title: "Valider l'offre de reprise ?",
      message: `Souhaitez-vous confirmer l'offre de ${new Intl.NumberFormat('fr-FR').format(demande.prixEstime || 0)} FCFA ? Cela finalisera la proposition pour le client.`,
      confirmText: "Valider l'offre",
      cancelText: 'Annuler',
      onConfirm: () => {
        const valObj = {
          nouveauStatut: 'ACCEPTE',
          prixPropose: demande.prixEstime || 0,
          commentaireAdmin: 'Offre de reprise acceptée par la plateforme.',
        };
        this.tradeInService.validerDemande(demande.id, valObj).subscribe(() => {
          this.toastService.success('Offre de reprise validée avec succès !');
          this.loadDemandes();
        });
      },
    });
  }

  rejeter(demande: any) {
    this.promptService.show({
      title: 'Rejeter la demande',
      message: 'Indiquez la raison du rejet pour informer le client.',
      confirmText: 'Rejeter',
      placeholder: 'Ex: Véhicule non conforme, prix trop bas...',
      onConfirm: (reason) => {
        if (reason) {
          this.tradeInService
            .updateStatut(demande.id, 'REJETEE')
            .subscribe(() => {
              this.toastService.warning('Demande de reprise rejetée');
              this.loadDemandes();
            });
        }
      },
    });
  }

  notifier(demande: any) {
    this.tradeInService.notifierUtilisateur(demande.id).subscribe({
      next: () => this.toastService.success('Rappel envoyé au vendeur !'),
      error: () =>
        this.toastService.error("Erreur lors de l'envoi de la notification"),
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'ACCEPTE':
      case 'VALIDEE':
        return 'bg-green-50 text-green-600';
      case 'EN_ATTENTE':
      case 'EN_COURS_EVALUATION':
      case 'EVALUATION_TERMINEE':
      case 'OFFRE_PROPOSEE':
        return 'bg-amber-50 text-amber-600';
      case 'REJETEE':
      case 'REFUSE':
        return 'bg-red-50 text-red-600';
      case 'TERMINEE':
        return 'bg-blue-50 text-blue-600';
      case 'ANNULEE':
        return 'bg-gray-50 text-gray-400';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  }
}
