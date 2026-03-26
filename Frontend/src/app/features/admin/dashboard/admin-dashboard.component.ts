import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Users,
  Car,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Shield,
  Megaphone,
  Repeat,
  MessageSquare,
  ChevronRight,
  Activity,
  Check,
} from 'lucide-angular';
import { AdminService } from '../../../core/services/admin.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SalesChartComponent } from './sales-chart.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    SalesChartComponent,
  ],
  template: `
    <div
      class="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto"
    >
      <!-- Top Title Bar -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1
            class="text-3xl md:text-4xl font-black tracking-tight text-gray-900"
          >
            Tableau de Bord
          </h1>
          <p class="text-gray-500 mt-2 font-medium">
            Bon retour parmi nous. Voici ce qui se passe aujourd'hui.
          </p>
        </div>

        <div
          class="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100"
        >
          <div
            class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"
          ></div>
          <span class="text-sm font-semibold text-gray-700"
            >Système opérationnel</span
          >
        </div>
      </div>

      <!-- System Health Indicator Row (Optional) -->

      <!-- Stats Grid (Glassmorphic) -->
      <ng-container *ngIf="stats$ | async as stats">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <!-- Ventes -->
          <div
            class="bg-gradient-to-br from-white to-primary-50/30 p-5 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full blur-2xl group-hover:bg-primary-100 transition-colors"
            ></div>
            <div class="flex items-center gap-4 mb-4 relative z-10">
              <div
                class="w-10 h-10 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center"
              >
                <lucide-angular
                  [img]="icons.TrendingUp"
                  size="20"
                ></lucide-angular>
              </div>
              <p
                class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
              >
                Total Ventes
              </p>
            </div>
            <h3
              class="text-2xl font-black text-gray-900 tracking-tight relative z-10"
            >
              {{ formatCurrency(stats.revenusTotaux) }}
            </h3>
          </div>

          <!-- Utilisateurs -->
          <div
            class="bg-gradient-to-br from-white to-blue-50/30 p-5 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"
            ></div>
            <div class="flex items-center gap-4 mb-4 relative z-10">
              <div
                class="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"
              >
                <lucide-angular [img]="icons.Users" size="20"></lucide-angular>
              </div>
              <p
                class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
              >
                Utilisateurs
              </p>
            </div>
            <h3
              class="text-2xl font-black text-gray-900 tracking-tight relative z-10"
            >
              {{ stats.totalUtilisateurs || 0 }}
            </h3>
          </div>

          <!-- Véhicules -->
          <div
            class="bg-gradient-to-br from-white to-indigo-50/30 p-5 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"
            ></div>
            <div class="flex items-center gap-4 mb-4 relative z-10">
              <div
                class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"
              >
                <lucide-angular [img]="icons.Car" size="20"></lucide-angular>
              </div>
              <p
                class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
              >
                Véhicules
              </p>
            </div>
            <h3
              class="text-2xl font-black text-gray-900 tracking-tight relative z-10"
            >
              {{ stats.totalAnnoncesActives || 0 }}
            </h3>
          </div>

          <!-- En attente -->
          <div
            class="bg-gradient-to-br from-white to-amber-50/30 p-5 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"
            ></div>
            <div class="flex items-center gap-4 mb-4 relative z-10">
              <div
                class="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"
              >
                <lucide-angular
                  [img]="icons.AlertCircle"
                  size="20"
                ></lucide-angular>
              </div>
              <p
                class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
              >
                Paiements Attente
              </p>
            </div>
            <h3
              class="text-2xl font-black text-gray-900 tracking-tight relative z-10"
            >
              {{ stats.paiementsEnAttente || 0 }}
            </h3>
          </div>

          <!-- Reprises -->
          <div
            class="bg-gradient-to-br from-white to-pink-50/30 p-5 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer"
            routerLink="/admin/trade-in"
          >
            <div
              class="absolute -right-6 -top-6 w-24 h-24 bg-pink-50 rounded-full blur-2xl group-hover:bg-pink-100 transition-colors"
            ></div>
            <div class="flex items-center gap-4 mb-4 relative z-10">
              <div
                class="w-10 h-10 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center"
              >
                <lucide-angular [img]="icons.Repeat" size="20"></lucide-angular>
              </div>
              <p
                class="text-[10px] text-gray-400 font-bold uppercase tracking-wider"
              >
                Reprises Attente
              </p>
            </div>
            <h3
              class="text-2xl font-black text-gray-900 tracking-tight relative z-10"
            >
              {{ stats.reprisesEnAttente || 0 }}
            </h3>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Sales Growth Curve Chart (Chart.js) -->
          <div
            class="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center"
          >
            <div class="flex justify-between items-center mb-8 w-full">
              <div>
                <h2 class="text-xl font-bold text-gray-900">
                  Courbe d'Évolution
                </h2>
                <p class="text-sm text-gray-500">Aperçu derniers mois</p>
              </div>
            </div>

            <app-sales-chart
              [data]="stats.chartData"
              class="w-full"
            ></app-sales-chart>
          </div>

          <!-- Latest Ads / Validation Rapide -->
          <div
            class="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full"
          >
            <div class="flex justify-between items-center mb-6">
              <h2
                class="text-xl font-bold text-gray-900 flex items-center gap-2"
              >
                Dernières Annonces
              </h2>
              <a
                routerLink="ads"
                class="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center"
              >
                Tout voir
                <lucide-angular
                  [img]="icons.ChevronRight"
                  size="16"
                ></lucide-angular>
              </a>
            </div>

            <ng-container *ngIf="latestAds$ | async as latestAds; else loading">
              <div class="flex-1 overflow-y-auto pr-2 space-y-4">
                <div
                  *ngIf="latestAds.length === 0"
                  class="text-center text-gray-500 text-sm py-4"
                >
                  Aucune annonce récente.
                </div>

                <div
                  *ngFor="let ad of latestAds"
                  class="flex gap-4 items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-colors min-h-[5rem]"
                >
                  <div
                    class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100"
                  >
                    <img
                      [src]="getImageUrl(ad.photosUrls?.[0])"
                      [alt]="ad.marque?.nom + ' ' + ad.modele?.nom"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors"
                    >
                      {{ ad.marque?.nom || 'Marque' }}
                      {{ ad.modele?.nom || 'Modèle' }}
                    </h4>
                    <p class="text-xs text-gray-500 mb-1">
                      <span
                        class="inline-block w-2 h-2 rounded-full mr-1 bg-yellow-400"
                      ></span
                      >{{ ad.statut || 'En attente' }}
                    </p>
                    <p class="text-sm font-bold text-primary-600">
                      {{ ad.prixFormate }}
                    </p>
                  </div>
                  <div>
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <lucide-angular
                        [img]="icons.Check"
                        size="16"
                      ></lucide-angular>
                    </button>
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-template #loading>
              <div class="flex-1 flex items-center justify-center py-12">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
                ></div>
              </div>
            </ng-template>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  icons = {
    Users,
    Car,
    CreditCard,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Shield,
    Megaphone,
    Repeat,
    MessageSquare,
    ChevronRight,
    Activity,
    Check,
  };

  stats$!: Observable<any>;
  latestAds$!: Observable<any>;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.stats$ = this.adminService.getDashboardStats().pipe(
      map((res) => {
        const data = res?.data ? res.data : res;

        // --- Calculate Chart Data ---
        // Provide mock data if no revenue data from DB
        const revenusMsg = data?.revenusMensuels || [
          12000000, 22000000, 35000000, 28000000, 55000000, 42000000, 70000000,
        ];

        // Generate month names for the last 7 months
        const monthNames: string[] = [];
        const d = new Date();
        for (let i = 6; i >= 0; i--) {
          const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
          monthNames.push(
            new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(past),
          );
        }

        data.chartData = revenusMsg.map((val: number, idx: number) => ({
          month: monthNames[idx],
          amount: val,
        }));

        return data;
      }),
    );

    this.latestAds$ = this.adminService
      .getAnnonces(0, 5, 'createdAt', 'desc')
      .pipe(
        map((res) => {
          // Handle paginated response content safely
          const annonces =
            res?.content ||
            res?.data?.content ||
            (res?.data?.items
              ? res.data.items
              : Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                  ? res
                  : []);
          return annonces.map((ad: any) => ({
            ...ad,
            shortId: ad.id
              ? ad.id.substring(0, 8)
              : Math.random().toString(36).substring(2, 10),
            prixFormate: new Intl.NumberFormat('fr-SN', {
              style: 'currency',
              currency: 'XOF',
            }).format(Number(ad.prixVente) || 0),
          }));
        }),
        catchError((err) => {
          console.error('Erreur annonces:', err);
          return of([]);
        }),
      );
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'assets/placeholder-car.jpg';
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace('/api', '');
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '0 FCFA';
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
    }).format(value);
  }
}
