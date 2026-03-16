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
    <div class="p-6 max-w-7xl mx-auto relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div class="mb-12">
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Console d'Administration</h1>
        <p class="text-gray-500 mt-2 font-medium">Vue d'ensemble de l'activité du SenCar Market.</p>
      </div>
 
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
           <div class="flex flex-col gap-6">
            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.Users" size="28"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Utilisateurs</p>
              <h3 class="text-3xl font-black text-gray-900 tracking-tight">{{ stats?.totalUtilisateurs || 0 }}</h3>
            </div>
          </div>
        </div>
 
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
          <div class="flex flex-col gap-6">
            <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.Car" size="28"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Annonces</p>
              <h3 class="text-3xl font-black text-gray-900 tracking-tight">{{ stats?.totalAnnonces || 0 }}</h3>
            </div>
          </div>
        </div>
 
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
          <div class="flex flex-col gap-6">
            <div class="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.TrendingUp" size="28"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Revenus</p>
              <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ formatCurrency(stats?.revenusTotaux) }}</h3>
            </div>
          </div>
        </div>
 
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
          <div class="flex flex-col gap-6">
            <div class="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <lucide-angular [img]="icons.CreditCard" size="28"></lucide-angular>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Transactions</p>
              <h3 class="text-3xl font-black text-gray-900 tracking-tight">{{ stats?.totalTransactions || 0 }}</h3>
            </div>
          </div>
        </div>
      </div>
 
      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 class="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
             <span class="w-2 h-8 bg-primary-600 rounded-full"></span>
             Gestion de la plateforme
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <a routerLink="users" class="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 border border-transparent hover:border-blue-100 transition-all group overflow-hidden relative">
              <div class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5"></div>
              <lucide-angular [img]="icons.Users" size="32" class="text-blue-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-900">Utilisateurs</span>
            </a>
            
            <a routerLink="ads" class="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 border border-transparent hover:border-indigo-100 transition-all group overflow-hidden relative">
              <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5"></div>
              <lucide-angular [img]="icons.Car" size="32" class="text-indigo-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-900">Annonces</span>
            </a>

            <a routerLink="transactions" class="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-2xl hover:shadow-green-100 border border-transparent hover:border-green-100 transition-all group overflow-hidden relative">
              <div class="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5"></div>
              <lucide-angular [img]="icons.CreditCard" size="32" class="text-green-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-900">Finance</span>
            </a>

            <a routerLink="certifications" class="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 border border-transparent hover:border-blue-100 transition-all group overflow-hidden relative">
              <div class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5"></div>
              <lucide-angular [img]="icons.Shield" size="32" class="text-blue-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-900">Certifs</span>
            </a>

            <a routerLink="trade-in" class="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-2xl hover:shadow-purple-100 border border-transparent hover:border-purple-100 transition-all group overflow-hidden relative">
              <div class="absolute inset-0 bg-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5"></div>
              <lucide-angular [img]="icons.Repeat" size="32" class="text-purple-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-900">Reprises</span>
            </a>

            <a routerLink="broadcast" class="aspect-square bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-2xl hover:shadow-amber-100 border border-transparent hover:border-amber-100 transition-all group overflow-hidden relative">
              <div class="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5"></div>
              <lucide-angular [img]="icons.Megaphone" size="32" class="text-amber-600 group-hover:scale-110 transition-transform"></lucide-angular>
              <span class="text-xs font-black uppercase tracking-widest text-gray-900">Diffusion</span>
            </a>
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="space-y-8">
          <div class="bg-gray-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h2 class="text-lg font-black mb-6 flex items-center gap-3">
              <lucide-angular [img]="icons.AlertCircle" size="20" class="text-amber-400"></lucide-angular>
              Alertes
            </h2>
            <div class="space-y-4">
              <div class="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all">
                <span class="text-xs font-bold text-gray-300">Paiements à valider</span>
                <span class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">{{ stats?.paiementsEnAttente || 0 }}</span>
              </div>
              <div class="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all">
                <span class="text-xs font-bold text-gray-300">Réservations en cours</span>
                <span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">{{ stats?.reservationsEnAttente || 0 }}</span>
              </div>
            </div>
          </div>

          <a routerLink="avis" class="block bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <lucide-angular [img]="icons.MessageSquare" size="24"></lucide-angular>
              </div>
              <div>
                <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Modération Avis</h4>
                <p class="text-[10px] text-gray-400 font-bold mt-1">Gérer la réputation</p>
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
