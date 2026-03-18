import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Users, Car, CreditCard, TrendingUp, AlertCircle, CheckCircle, Shield, Megaphone, Repeat, MessageSquare } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  template: `
    <div class="p-6 lg:p-8 relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div class="mb-10">
        <h2 class="text-4xl font-black text-gray-900 tracking-tight">Tableau de Bord</h2>
        <p class="text-gray-500 mt-2 font-medium">Vue d'ensemble de l'activité du SenCar Market.</p>
      </div>
 
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
          <div class="flex flex-col gap-5">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.Users" size="22"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Utilisateurs</p>
              <h3 class="text-3xl font-black text-gray-900 tracking-tight">{{ stats?.totalUtilisateurs || 0 }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
          <div class="flex flex-col gap-5">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.Car" size="22"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Annonces</p>
              <h3 class="text-3xl font-black text-gray-900 tracking-tight">{{ stats?.totalAnnonces || 0 }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
          <div class="flex flex-col gap-5">
            <div class="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.TrendingUp" size="22"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Revenus</p>
              <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ formatCurrency(stats?.revenusTotaux) }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300">
          <div class="flex flex-col gap-5">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.CreditCard" size="22"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Transactions</p>
              <h3 class="text-3xl font-black text-gray-900 tracking-tight">{{ stats?.totalTransactions || 0 }}</h3>
            </div>
          </div>
        </div>
      </div>
 
      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <lucide-angular [img]="icons.Shield" size="20" class="text-primary-600"></lucide-angular>
            Gestion de la plateforme
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <a routerLink="users" class="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md hover:border-blue-100 border border-transparent transition-all duration-200 group">
              <lucide-angular [img]="icons.Users" size="28" class="text-blue-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-700">Utilisateurs</span>
            </a>
            <a routerLink="ads" class="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md hover:border-indigo-100 border border-transparent transition-all duration-200 group">
              <lucide-angular [img]="icons.Car" size="28" class="text-indigo-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-700">Annonces</span>
            </a>
            <a routerLink="transactions" class="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md hover:border-green-100 border border-transparent transition-all duration-200 group">
              <lucide-angular [img]="icons.CreditCard" size="28" class="text-green-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-700">Finance</span>
            </a>
            <a routerLink="certifications" class="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md hover:border-blue-100 border border-transparent transition-all duration-200 group">
              <lucide-angular [img]="icons.Shield" size="28" class="text-blue-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-700">Certifs</span>
            </a>
            <a routerLink="trade-in" class="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md hover:border-purple-100 border border-transparent transition-all duration-200 group">
              <lucide-angular [img]="icons.Repeat" size="28" class="text-purple-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-700">Reprises</span>
            </a>
            <a routerLink="broadcast" class="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md hover:border-amber-100 border border-transparent transition-all duration-200 group">
              <lucide-angular [img]="icons.Megaphone" size="28" class="text-amber-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-700">Diffusion</span>
            </a>
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="space-y-6">
          <div class="bg-gray-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <lucide-angular [img]="icons.AlertCircle" size="20" class="text-amber-400"></lucide-angular>
              Alertes
            </h2>
            <div class="space-y-3">
              <div class="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:bg-white/10 transition-all">
                <span class="text-xs font-bold text-gray-300">Paiements à valider</span>
                <span class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">{{ stats?.paiementsEnAttente || 0 }}</span>
              </div>
              <div class="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:bg-white/10 transition-all">
                <span class="text-xs font-bold text-gray-300">Réservations en cours</span>
                <span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">{{ stats?.reservationsEnAttente || 0 }}</span>
              </div>
            </div>
          </div>

          <a routerLink="avis" class="block bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-angular [img]="icons.MessageSquare" size="22"></lucide-angular>
              </div>
              <div>
                <h4 class="text-sm font-bold text-gray-900">Modération Avis</h4>
                <p class="text-xs text-gray-400 font-medium mt-0.5">Gérer la réputation</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats: any = null;
  icons = { Users, Car, CreditCard, TrendingUp, AlertCircle, CheckCircle, Shield, Megaphone, Repeat, MessageSquare };

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error loading admin stats', err)
    });
  }

  formatCurrency(amount: number | null): string {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }
}
