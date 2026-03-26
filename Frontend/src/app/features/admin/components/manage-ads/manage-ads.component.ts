import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import {
  LucideAngularModule,
  Car,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Search,
  Filter,
} from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-manage-ads',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    FormsModule,
    PaginationComponent,
  ],
  template: `
    <div class="p-6 lg:p-8 relative overflow-hidden">
      <!-- Decorative background -->
      <div
        class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"
      ></div>

      <div class="mb-10">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h2 class="text-4xl font-black text-gray-900 tracking-tight">
              Annonces
            </h2>
            <p class="text-gray-500 mt-2 font-medium">
              Modération et supervision du catalogue.
            </p>
          </div>
          <div class="relative w-full md:w-80">
            <lucide-angular
              [img]="icons.Search"
              size="18"
              class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            ></lucide-angular>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterAds()"
              placeholder="Rechercher une annonce..."
              class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/30 border-b border-gray-100">
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Véhicule
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right"
                >
                  Prix de vente
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center"
                >
                  Statut
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                *ngFor="let ad of pagedAds"
                class="hover:bg-primary-50/10 transition-colors group"
              >
                <td class="px-8 py-6">
                  <div class="flex items-center gap-5">
                    <div
                      class="w-16 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500"
                    >
                      <img
                        *ngIf="ad.photosUrls?.length > 0"
                        [src]="getImageUrl(ad.photosUrls[0])"
                        class="w-full h-full object-cover"
                      />
                      <img
                        *ngIf="!ad.photosUrls?.length"
                        src="assets/placeholder-car.jpg"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div
                        class="font-black text-gray-900 text-sm tracking-tight group-hover:text-primary-600 transition-colors"
                      >
                        {{ ad.titre || ad.marque?.nom + ' ' + ad.modele?.nom }}
                      </div>
                      <div
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60"
                      >
                        {{ ad.marque?.nom || ad.marque }}
                        <span class="mx-1">•</span>
                        {{ ad.anneeFabrication || ad.annee }}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  class="px-8 py-6 text-right font-black text-primary-600 tracking-tight"
                >
                  {{ ad.prixVente | number }}
                  <span class="text-[10px]">FCFA</span>
                </td>
                <td class="px-8 py-6 text-center">
                  <span
                    class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    [ngClass]="getStatusClass(ad.statut)"
                  >
                    {{ ad.statut }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-1">
                    <a
                      [routerLink]="['/vehicles', ad.id]"
                      target="_blank"
                      title="Voir l'annonce"
                      class="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all active:scale-95 group/btn"
                    >
                      <lucide-angular
                        [img]="icons.Eye"
                        size="18"
                        class="group-hover/btn:scale-110 transition-transform"
                      ></lucide-angular>
                    </a>
                    <button
                      *ngIf="
                        ad.statut === 'EN_ATTENTE_VALIDATION' ||
                        ad.statut === 'DESACTIVE' ||
                        ad.statut === 'REJETE' ||
                        ad.statut === 'EN_ATTENTE'
                      "
                      (click)="valider(ad)"
                      title="Activer / Approuver l'annonce"
                      class="p-3 text-green-500 hover:bg-green-50 rounded-2xl transition-all active:scale-95 group/btn"
                    >
                      <lucide-angular
                        [img]="icons.CheckCircle"
                        size="18"
                        class="group-hover/btn:scale-110 transition-transform"
                      ></lucide-angular>
                    </button>
                    <button
                      *ngIf="
                        ad.statut === 'PUBLIE' ||
                        ad.statut === 'VALIDE' ||
                        ad.statut === 'ACTIF' ||
                        ad.statut === 'ACTIVE'
                      "
                      (click)="desactiver(ad)"
                      title="Désactiver l'annonce"
                      class="p-3 text-amber-500 hover:bg-amber-50 rounded-2xl transition-all active:scale-95 group/btn"
                    >
                      <lucide-angular
                        [img]="icons.XCircle"
                        size="18"
                        class="group-hover/btn:rotate-12 transition-transform"
                      ></lucide-angular>
                    </button>
                    <button
                      (click)="supprimer(ad)"
                      title="Supprimer l'annonce"
                      class="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95 group/btn"
                    >
                      <lucide-angular
                        [img]="icons.Trash2"
                        size="18"
                        class="group-hover/btn:scale-125 transition-transform"
                      ></lucide-angular>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-pagination
          [totalItems]="totalAds"
          [pageSize]="PAGE_SIZE"
          [currentPage]="currentPage"
          (pageChange)="onPageChange($event)"
        >
        </app-pagination>

        <div *ngIf="ads.length === 0" class="py-32 text-center">
          <div
            class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <lucide-angular
              [img]="icons.Filter"
              size="40"
              class="text-gray-200"
            ></lucide-angular>
          </div>
          <p class="text-gray-400 font-black uppercase tracking-widest">
            Aucune annonce
          </p>
          <p class="text-gray-300 text-sm mt-2">
            Nous n'avons trouvé aucune annonce correspondant à vos critères.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ManageAdsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  ads: any[] = [];
  totalAds = 0;
  searchQuery = '';
  currentPage = 0;
  readonly PAGE_SIZE = 10;
  icons = { Car, CheckCircle, XCircle, Trash2, Eye, Search, Filter };

  get pagedAds(): any[] {
    return this.ads;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAds();
  }

  ngOnInit() {
    this.loadAds();
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'assets/placeholder-car.jpg';
    if (url.startsWith('http')) return url;
    const base = 'https://sencar-market.onrender.com';
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }

  loadAds() {
    console.log(
      'Loading ads - page:',
      this.currentPage,
      'size:',
      this.PAGE_SIZE,
    );
    this.adminService.getAnnonces(this.currentPage, this.PAGE_SIZE).subscribe({
      next: (res: any) => {
        console.log('Ads API response:', res);
        console.log('Ads content:', res?.content);
        console.log('Ads totalElements:', res?.totalElements);
        this.ads = res?.content || [];
        this.totalAds = res?.totalElements || 0;
      },
      error: (err) => console.error('Error loading ads', err),
    });
  }

  filterAds() {
    this.currentPage = 0;
    this.loadAds();
  }

  valider(ad: any) {
    this.adminService.validerAnnonce(ad.id).subscribe(() => {
      this.toastService.success('Annonce validée avec succès');
      this.loadAds();
    });
  }

  desactiver(ad: any) {
    this.adminService
      .desactiverAnnonce(ad.id, 'Désactivée par modération')
      .subscribe(() => {
        this.toastService.success('Annonce désactivée avec succès');
        this.loadAds();
      });
  }

  supprimer(ad: any) {
    this.confirmService.show({
      title: "Supprimer l'annonce",
      message: `Êtes-vous sûr de vouloir supprimer l'annonce "${ad.titre || ad.marque + ' ' + ad.modele}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: () => {
        this.adminService.supprimerAnnonce(ad.id).subscribe(() => {
          this.toastService.success('Annonce supprimée avec succès');
          this.loadAds();
        });
      },
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'PUBLIE':
      case 'ACTIF':
      case 'ACTIVE':
      case 'VALIDE':
        return 'bg-green-50 text-green-600';
      case 'EN_ATTENTE_VALIDATION':
      case 'EN_ATTENTE':
        return 'bg-amber-50 text-amber-600';
      case 'DESACTIVE':
        return 'bg-gray-50 text-gray-500';
      case 'REJETE':
      case 'REJETEE':
        return 'bg-red-50 text-red-600';
      case 'VENDU':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  }
}
