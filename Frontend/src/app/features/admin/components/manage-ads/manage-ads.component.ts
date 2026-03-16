import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { LucideAngularModule, Car, CheckCircle, XCircle, Trash2, Eye, Search, Filter } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-ads',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 class="text-4xl font-black text-gray-900 tracking-tight">Annonces</h2>
          <p class="text-gray-500 mt-2 font-medium">Modération et supervision du catalogue.</p>
        </div>
        <div class="relative w-full md:w-80">
          <lucide-angular [img]="icons.Search" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
          <input type="text" 
                 [(ngModel)]="searchQuery" 
                 (input)="filterAds()"
                 placeholder="Rechercher une annonce..." 
                 class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300">
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/30 border-b border-gray-100">
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Véhicule</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Prix de vente</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Statut</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let ad of filteredAds" class="hover:bg-primary-50/10 transition-colors group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-5">
                    <div class="w-16 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <img *ngIf="ad.photos?.length > 0" [src]="ad.photos[0]" class="w-full h-full object-cover">
                      <lucide-angular *ngIf="!ad.photos?.length" [img]="icons.Car" size="24"></lucide-angular>
                    </div>
                    <div>
                      <div class="font-black text-gray-900 text-sm tracking-tight group-hover:text-primary-600 transition-colors">
                        {{ ad.titre || (ad.marque + ' ' + ad.modele) }}
                      </div>
                      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">
                        {{ ad.marque }} <span class="mx-1">•</span> {{ ad.annee }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6 text-right font-black text-primary-600 tracking-tight">
                  {{ ad.prixVente | number }} <span class="text-[10px]">FCFA</span>
                </td>
                <td class="px-8 py-6 text-center">
                  <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        [ngClass]="getStatusClass(ad.statut)">
                    {{ ad.statut }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-1">
                    <a [routerLink]="['/vehicles', ad.id]" 
                       target="_blank"
                       title="Voir l'annonce"
                       class="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.Eye" size="18" class="group-hover/btn:scale-110 transition-transform"></lucide-angular>
                    </a>
                    <button *ngIf="ad.statut === 'EN_ATTENTE_VALIDATION'" 
                            (click)="valider(ad)"
                            title="Approuver l'annonce"
                            class="p-3 text-green-500 hover:bg-green-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.CheckCircle" size="18" class="group-hover/btn:scale-110 transition-transform"></lucide-angular>
                    </button>
                    <button *ngIf="ad.statut === 'VALIDE' || ad.statut === 'ACTIF' || ad.statut === 'ACTIVE'" 
                            (click)="desactiver(ad)"
                            title="Mettre en pause"
                            class="p-3 text-amber-500 hover:bg-amber-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.XCircle" size="18" class="group-hover/btn:rotate-12 transition-transform"></lucide-angular>
                    </button>
                    <button (click)="supprimer(ad)"
                            title="Supprimer l'annonce"
                            class="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.Trash2" size="18" class="group-hover/btn:scale-125 transition-transform"></lucide-angular>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="filteredAds.length === 0" class="py-32 text-center">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <lucide-angular [img]="icons.Filter" size="40" class="text-gray-200"></lucide-angular>
          </div>
          <p class="text-gray-400 font-black uppercase tracking-widest">Aucune annonce</p>
          <p class="text-gray-300 text-sm mt-2">Nous n'avons trouvé aucune annonce correspondant à vos critères.</p>
        </div>
      </div>
    </div>
  `
})
export class ManageAdsComponent implements OnInit {
  private adminService = inject(AdminService);
  ads: any[] = [];
  filteredAds: any[] = [];
  searchQuery = '';
  icons = { Car, CheckCircle, XCircle, Trash2, Eye, Search, Filter };

  ngOnInit() {
    this.loadAds();
  }

  loadAds() {
    this.adminService.getAnnonces().subscribe({
      next: (res) => {
        this.ads = res.content;
        this.filterAds();
      },
      error: (err) => console.error('Error loading ads', err)
    });
  }

  filterAds() {
    if (!this.searchQuery) {
      this.filteredAds = this.ads;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredAds = this.ads.filter(ad => 
        (ad.titre && ad.titre.toLowerCase().includes(q)) ||
        ad.marque.toLowerCase().includes(q) ||
        ad.modele.toLowerCase().includes(q)
      );
    }
  }

  valider(ad: any) {
    if (confirm("Valider cette annonce pour publication ?")) {
      this.adminService.validerAnnonce(ad.id).subscribe(() => this.loadAds());
    }
  }

  desactiver(ad: any) {
    const reason = prompt("Raison de la désactivation (sera notifiée au vendeur) :");
    if (reason) {
      this.adminService.desactiverAnnonce(ad.id, reason).subscribe(() => this.loadAds());
    }
  }

  supprimer(ad: any) {
    if (confirm("Supprimer DEFINITIVEMENT cette annonce ? Cette action est irréversible.")) {
      this.adminService.supprimerAnnonce(ad.id).subscribe(() => this.loadAds());
    }
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'ACTIF':
      case 'ACTIVE':
      case 'VALIDE': return 'bg-green-50 text-green-600';
      case 'EN_ATTENTE_VALIDATION': return 'bg-amber-50 text-amber-600';
      case 'DESACTIVE': return 'bg-gray-50 text-gray-500';
      case 'REJETE': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  }
}
