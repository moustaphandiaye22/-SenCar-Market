import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { LucideAngularModule, User, MoreVertical, ShieldAlert, UserCheck, UserX, Search } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 class="text-4xl font-black text-gray-900 tracking-tight">Utilisateurs</h2>
          <p class="text-gray-500 mt-2 font-medium">Gérez la communauté et les droits d'accès.</p>
        </div>
        <div class="relative w-full md:w-80">
          <lucide-angular [img]="icons.Search" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
          <input type="text" 
                 [(ngModel)]="searchQuery" 
                 (input)="filterUsers()"
                 placeholder="Rechercher par nom, email..." 
                 class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300">
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/30 border-b border-gray-100">
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Membre</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rôle Système</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">État du Compte</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Modération</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let u of filteredUsers" class="hover:bg-primary-50/10 transition-colors group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                      {{ (u.prenom?.[0] || '') + (u.nom?.[0] || '') }}
                    </div>
                    <div>
                      <div class="font-black text-gray-900 text-sm tracking-tight capitalize">{{ u.prenom }} {{ u.nom }}</div>
                      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 opacity-60">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="relative inline-block">
                    <select [ngModel]="u.role" 
                            (ngModelChange)="changerRole(u, $event)"
                            class="appearance-none bg-gray-50 border border-transparent text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 pr-8 outline-none cursor-pointer hover:bg-white hover:border-gray-200 transition-all focus:ring-4 focus:ring-primary-50">
                      <option value="UTILISATEUR">Utilisateur</option>
                      <option value="PROFESSIONNEL">Professionnel</option>
                      <option value="EXPERT">Expert</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6 text-center">
                  <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        [ngClass]="u.estActif ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                    <span class="w-1.5 h-1.5 rounded-full mr-2" 
                          [ngClass]="u.estActif ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
                    {{ u.estActif ? 'Actif' : 'Suspendu' }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-1">
                    <button *ngIf="u.estActif" 
                            (click)="suspendre(u)"
                            title="Suspendre le compte"
                            class="p-3 text-amber-500 hover:bg-amber-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.ShieldAlert" size="18" class="group-hover/btn:rotate-12 transition-transform"></lucide-angular>
                    </button>
                    <button *ngIf="!u.estActif" 
                            (click)="reactiver(u)"
                            title="Réactiver le compte"
                            class="p-3 text-green-500 hover:bg-green-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.UserCheck" size="18" class="group-hover/btn:rotate-12 transition-transform"></lucide-angular>
                    </button>
                    <button (click)="bannir(u)"
                            title="Bannir définitivement"
                            class="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.UserX" size="18" class="group-hover/btn:scale-125 transition-transform"></lucide-angular>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredUsers.length === 0" class="py-32 text-center">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <lucide-angular [img]="icons.Search" size="40" class="text-gray-200"></lucide-angular>
          </div>
          <p class="text-gray-400 font-black uppercase tracking-widest">Aucun résultat</p>
          <p class="text-gray-300 text-sm mt-2">Nous n'avons trouvé aucun utilisateur pour cette recherche.</p>
        </div>
      </div>
    </div>
  `
})
export class ManageUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery = '';
  icons = { User, MoreVertical, ShieldAlert, UserCheck, UserX, Search };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUtilisateurs().subscribe({
      next: (res) => {
        this.users = res.content;
        this.filterUsers();
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  filterUsers() {
    if (!this.searchQuery) {
      this.filteredUsers = this.users;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(u => 
        u.prenom.toLowerCase().includes(q) || 
        u.nom.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }
  }

  changerRole(user: any, newRole: string) {
    if (confirm(`Changer le rôle de ${user.prenom} en ${newRole} ?`)) {
      this.adminService.modifierRole(user.id, newRole).subscribe(() => this.loadUsers());
    }
  }

  suspendre(user: any) {
    const reason = prompt("Raison de la suspension :");
    if (reason) {
      this.adminService.suspendreUtilisateur(user.id, reason).subscribe(() => this.loadUsers());
    }
  }

  reactiver(user: any) {
    if (confirm(`Réactiver l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      this.adminService.reactiverUtilisateur(user.id).subscribe(() => this.loadUsers());
    }
  }

  bannir(user: any) {
    const reason = prompt("Raison du bannissement (Action IRRÉVERSIBLE) :");
    if (reason) {
      this.adminService.bannirUtilisateur(user.id, reason).subscribe(() => this.loadUsers());
    }
  }
}
