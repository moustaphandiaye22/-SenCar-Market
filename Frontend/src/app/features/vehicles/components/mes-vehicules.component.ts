import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { VehiculeResponse } from '../../../core/models/vehicule.model';
import { environment } from '../../../../environments/environment';
import {
  LucideAngularModule, Plus, Car, Edit, Trash2, Eye, Zap,
  CheckCircle, Clock, AlertCircle, XCircle
} from 'lucide-angular';

@Component({
  selector: 'app-mes-vehicules',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
<div class="min-h-screen bg-gray-50/50 pb-20 pt-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Mes annonces</h1>
        <p class="text-sm text-gray-500 mt-1">Gérez vos véhicules en vente</p>
      </div>
      <a routerLink="/vehicles/new"
         class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all">
        <lucide-angular [img]="icons.Plus" size="18"></lucide-angular>
        Nouvelle annonce
      </a>
    </div>

    <!-- Loading -->
    <div *ngIf="isLoading" class="grid grid-cols-1 gap-4">
      <div *ngFor="let i of [1,2,3]" class="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 flex gap-6">
        <div class="w-40 h-28 bg-gray-200 rounded-xl shrink-0"></div>
        <div class="flex-1 space-y-3">
          <div class="h-5 bg-gray-200 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div *ngIf="!isLoading && vehicules.length === 0"
         class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100">
      <div class="bg-gray-100 p-6 rounded-full mb-4">
        <lucide-angular [img]="icons.Car" size="48" class="text-gray-400"></lucide-angular>
      </div>
      <h3 class="text-lg font-bold text-gray-900">Aucune annonce publiée</h3>
      <p class="text-gray-500 mt-1 mb-6">Commencez par créer votre première annonce.</p>
      <a routerLink="/vehicles/new"
         class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
        <lucide-angular [img]="icons.Plus" size="16"></lucide-angular>
        Vendre un véhicule
      </a>
    </div>

    <!-- Liste des annonces -->
    <div *ngIf="!isLoading && vehicules.length > 0" class="space-y-4">
      <div *ngFor="let v of vehicules"
           class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div class="flex flex-col sm:flex-row gap-0">

          <!-- Image -->
          <a [routerLink]="['/vehicles', v.id]" class="block sm:w-44 h-36 shrink-0 overflow-hidden bg-gray-100">
            <img *ngIf="v.photosUrls?.length"
                 [src]="getImageUrl(v.photosUrls[0])"
                 [alt]="v.marque + ' ' + v.modele"
                 class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
            <div *ngIf="!v.photosUrls?.length"
                 class="w-full h-full flex items-center justify-center text-gray-300">
              <lucide-angular [img]="icons.Car" size="36"></lucide-angular>
            </div>
          </a>

          <!-- Infos -->
          <div class="flex-1 p-5 flex flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span [ngClass]="getStatutClass(v.statut)"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <lucide-angular [img]="getStatutIcon(v.statut)" size="10"></lucide-angular>
                    {{ v.statut }}
                  </span>
                  <span *ngIf="v.estBoost" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    <lucide-angular [img]="icons.Zap" size="10"></lucide-angular>
                    Boosté
                  </span>
                </div>
                <a [routerLink]="['/vehicles', v.id]"
                   class="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                  {{ v.marque }} {{ v.modele }} {{ v.anneeFabrication }}
                </a>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ v.kilometrage | number }} km · {{ v.carburant }} · {{ v.couleur }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xl font-extrabold text-primary-600">{{ formatPrice(v.prixVente) }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ v.vues || 0 }} vues · {{ v.nombreFavoris || 0 }} favoris</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
              <a [routerLink]="['/vehicles', v.id]"
                 class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                <lucide-angular [img]="icons.Eye" size="13"></lucide-angular>
                Voir
              </a>
              <a [routerLink]="['/vehicles', v.id, 'edit']"
                 class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all">
                <lucide-angular [img]="icons.Edit" size="13"></lucide-angular>
                Modifier
              </a>
              <button *ngIf="v.statut === 'BROUILLON'"
                      (click)="publier(v)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all">
                <lucide-angular [img]="icons.CheckCircle" size="13"></lucide-angular>
                Publier
              </button>
              <button (click)="confirmerSuppression(v)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all">
                <lucide-angular [img]="icons.Trash2" size="13"></lucide-angular>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Modal confirmation suppression -->
  <div *ngIf="vehiculeASupprimer"
       class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
       (click)="annulerSuppression()">
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
          <lucide-angular [img]="icons.Trash2" size="22" class="text-red-600"></lucide-angular>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">Supprimer cette annonce ?</h3>
          <p class="text-sm text-gray-500">
            {{ vehiculeASupprimer.marque }} {{ vehiculeASupprimer.modele }} — cette action est irréversible.
          </p>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button (click)="annulerSuppression()"
                class="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
          Annuler
        </button>
        <button (click)="supprimerVehicule()"
                [disabled]="supprimerLoading"
                class="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all">
          {{ supprimerLoading ? 'Suppression...' : 'Supprimer' }}
        </button>
      </div>
    </div>
  </div>
</div>
  `
})
export class MesVehiculesComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);

  vehicules: VehiculeResponse[] = [];
  isLoading = true;
  vehiculeASupprimer: VehiculeResponse | null = null;
  supprimerLoading = false;

  icons = { Plus, Car, Edit, Trash2, Eye, Zap, CheckCircle, Clock, AlertCircle, XCircle };

  ngOnInit(): void {
    this.loadMesVehicules();
  }

  loadMesVehicules(): void {
    this.isLoading = true;
    this.vehiculeService.getMesVehicules().subscribe({
      next: (data) => {
        this.vehicules = data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  publier(v: VehiculeResponse): void {
    this.vehiculeService.publishVehicule(v.id).subscribe({
      next: (updated) => {
        const idx = this.vehicules.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.vehicules[idx] = updated;
      }
    });
  }

  confirmerSuppression(v: VehiculeResponse): void {
    this.vehiculeASupprimer = v;
  }

  annulerSuppression(): void {
    this.vehiculeASupprimer = null;
  }

  supprimerVehicule(): void {
    if (!this.vehiculeASupprimer) return;
    this.supprimerLoading = true;
    this.vehiculeService.deleteVehicule(this.vehiculeASupprimer.id).subscribe({
      next: () => {
        this.vehicules = this.vehicules.filter(v => v.id !== this.vehiculeASupprimer!.id);
        this.vehiculeASupprimer = null;
        this.supprimerLoading = false;
      },
      error: () => { this.supprimerLoading = false; }
    });
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      PUBLIE: 'bg-green-100 text-green-700',
      BROUILLON: 'bg-gray-100 text-gray-600',
      VENDU: 'bg-blue-100 text-blue-700',
      SUSPENDU: 'bg-red-100 text-red-600',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }

  getStatutIcon(statut: string): any {
    const map: Record<string, any> = {
      PUBLIE: this.icons.CheckCircle,
      BROUILLON: this.icons.Clock,
      VENDU: this.icons.CheckCircle,
      SUSPENDU: this.icons.XCircle,
    };
    return map[statut] ?? this.icons.AlertCircle;
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  formatPrice(price: string | null): string {
    if (!price) return '0 FCFA';
    const num = parseFloat(price);
    if (isNaN(num)) return price + ' FCFA';
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  }
}
