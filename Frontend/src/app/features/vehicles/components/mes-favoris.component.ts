import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { VehiculeResponse } from '../../../core/models/vehicule.model';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Heart, MapPin, Gauge, Fuel, Zap, HeartOff } from 'lucide-angular';

@Component({
  selector: 'app-mes-favoris',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
<div class="min-h-screen bg-gray-50/50 pb-20 pt-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Mes favoris</h1>
      <p class="text-sm text-gray-500 mt-1">{{ vehicules.length }} véhicule(s) sauvegardé(s)</p>
    </div>

    <!-- Loading -->
    <div *ngIf="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let i of [1,2,3]" class="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="h-48 bg-gray-200"></div>
        <div class="p-4 space-y-3">
          <div class="h-5 bg-gray-200 rounded w-2/3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div *ngIf="!isLoading && vehicules.length === 0"
         class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100">
      <div class="bg-red-50 p-6 rounded-full mb-4">
        <lucide-angular [img]="icons.Heart" size="48" class="text-red-300"></lucide-angular>
      </div>
      <h3 class="text-lg font-bold text-gray-900">Aucun favori</h3>
      <p class="text-gray-500 mt-1 mb-6">Ajoutez des véhicules à vos favoris depuis le marketplace.</p>
      <a routerLink="/vehicles"
         class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
        Parcourir le marketplace
      </a>
    </div>

    <!-- Grid favoris -->
    <div *ngIf="!isLoading && vehicules.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let v of vehicules"
           class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary-100 transition-all duration-300 overflow-hidden relative">

        <!-- Boost badge -->
        <div *ngIf="v.estBoost" class="absolute top-3 left-3 z-10">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-white shadow-sm ring-2 ring-white uppercase tracking-wider">
            <lucide-angular [img]="icons.Zap" size="10" class="mr-1"></lucide-angular>
            Premium
          </span>
        </div>

        <!-- Retirer des favoris -->
        <button (click)="supprimerFavori(v)"
                class="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-red-100 hover:bg-red-50 transition-all">
          <lucide-angular [img]="icons.Heart" size="18" class="text-red-500 fill-red-500"></lucide-angular>
        </button>

        <a [routerLink]="['/vehicles', v.id]" class="block">
          <!-- Image -->
          <div class="h-52 overflow-hidden bg-gray-100 relative">
            <img *ngIf="v.photosUrls?.length"
                 [src]="getImageUrl(v.photosUrls[0])"
                 [alt]="v.marque + ' ' + v.modele"
                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            <div *ngIf="!v.photosUrls?.length"
                 class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
              <lucide-angular [img]="icons.Heart" size="48"></lucide-angular>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <!-- Infos -->
          <div class="p-5">
            <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {{ v.marque }} {{ v.modele }}
            </h3>
            <div class="flex items-center text-gray-500 text-xs mt-1">
              <lucide-angular [img]="icons.MapPin" size="12" class="mr-1"></lucide-angular>
              Dakar, Sénégal
            </div>
            <div class="grid grid-cols-2 gap-y-3 mt-4">
              <div class="flex items-center text-gray-600 text-sm">
                <lucide-angular [img]="icons.Gauge" size="14" class="mr-2 text-primary-500"></lucide-angular>
                {{ v.kilometrage | number }} km
              </div>
              <div class="flex items-center text-gray-600 text-sm">
                <lucide-angular [img]="icons.Fuel" size="14" class="mr-2 text-primary-500"></lucide-angular>
                {{ v.carburant }}
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-medium">Prix</span>
                <span class="text-xl font-extrabold text-primary-600">{{ formatPrice(v.prixVente) }}</span>
              </div>
              <div class="px-2.5 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                {{ v.anneeFabrication }}
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>

  </div>
</div>
  `
})
export class MesFavorisComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);

  vehicules: VehiculeResponse[] = [];
  isLoading = true;

  icons = { Heart, MapPin, Gauge, Fuel, Zap, HeartOff };

  ngOnInit(): void {
    this.vehiculeService.getMesFavoris().subscribe({
      next: (data) => {
        this.vehicules = data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  supprimerFavori(v: VehiculeResponse): void {
    this.vehiculeService.removeFromFavoris(v.id).subscribe(() => {
      this.vehicules = this.vehicules.filter(f => f.id !== v.id);
    });
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
