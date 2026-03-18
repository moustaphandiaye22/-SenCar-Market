import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationService } from '../../../../core/services/certification.service';
import { LucideAngularModule, Shield, Check, X, Search, Filter, Calendar } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-certifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>

      <div class="mb-10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 class="text-4xl font-black text-gray-900 tracking-tight">Certifications</h2>
            <p class="text-gray-500 mt-2 font-medium">Validation technique et labellisation des véhicules.</p>
          </div>
          <div class="relative w-full md:w-80">
            <lucide-angular [img]="icons.Search" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (input)="filterDemandes()"
                   placeholder="Filtrer les demandes..." 
                   class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300">
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/30 border-b border-gray-100">
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dossier Véhicule</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Soumission</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Statut</th>
                <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let d of filteredDemandes" class="hover:bg-primary-50/10 transition-colors group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <lucide-angular [img]="icons.Shield" size="22"></lucide-angular>
                    </div>
                    <div>
                      <div class="font-black text-gray-900 text-sm tracking-tight capitalize group-hover:text-primary-600 transition-colors">
                        {{ d.vehiculeMarque }} {{ d.vehiculeModele }}
                      </div>
                      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60 italic">Réf: {{ d.vehiculeId?.slice(0,8) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6 text-center">
                  <div class="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{{ d.dateSoumission | date:'dd MMM yyyy' }}</div>
                  <div class="text-[10px] font-bold text-gray-400 mt-1">{{ d.dateSoumission | date:'HH:mm' }}</div>
                </td>
                <td class="px-8 py-6 text-center">
                  <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        [ngClass]="getStatusClass(d.statut)">
                    <span class="w-1.5 h-1.5 rounded-full mr-2" 
                          [ngClass]="d.statut === 'EN_ATTENTE' ? 'bg-amber-500 animate-pulse' : (d.statut === 'CERTIFIEE' ? 'bg-green-500' : 'bg-red-500')"></span>
                    {{ d.statut }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-2" *ngIf="d.statut === 'EN_ATTENTE' || d.statut === 'PAYEE'">
                    <button (click)="valider(d)" 
                            title="Certifier le véhicule"
                            class="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.Check" size="20" class="group-hover/btn:scale-125 transition-transform"></lucide-angular>
                    </button>
                    <button (click)="rejeter(d)" 
                            title="Rejeter le dossier"
                            class="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-95 group/btn">
                      <lucide-angular [img]="icons.X" size="20" class="group-hover/btn:scale-125 transition-transform"></lucide-angular>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredDemandes.length === 0" class="py-32 text-center">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <lucide-angular [img]="icons.Calendar" size="40" class="text-gray-200"></lucide-angular>
          </div>
          <p class="text-gray-400 font-black uppercase tracking-widest">Aucune demande</p>
          <p class="text-gray-300 text-sm mt-2">Nous n'avons trouvé aucune demande de certification pour le moment.</p>
        </div>
      </div>
    </div>
  `
})
export class ManageCertificationsComponent implements OnInit {
  private certService = inject(CertificationService);
  demandes: any[] = [];
  filteredDemandes: any[] = [];
  searchQuery = '';
  icons = { Shield, Check, X, Search, Filter, Calendar };

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.certService.getDemandesForAdmin().subscribe({
      next: (res) => {
        this.demandes = res;
        this.filterDemandes();
      },
      error: (err) => console.error('Error loading certifications', err)
    });
  }

  filterDemandes() {
    if (!this.searchQuery) {
      this.filteredDemandes = this.demandes;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredDemandes = this.demandes.filter(d => 
        (d.vehiculeMarque && d.vehiculeMarque.toLowerCase().includes(q)) ||
        (d.vehiculeModele && d.vehiculeModele.toLowerCase().includes(q)) ||
        (d.statut && d.statut.toLowerCase().includes(q))
      );
    }
  }

  valider(d: any) {
    if (confirm('Voulez-vous valider cette demande de certification ?')) {
      this.certService.validerDemande(d.id).subscribe(() => this.loadDemandes());
    }
  }

  rejeter(d: any) {
    const raison = prompt('Raison du rejet (sera communiquée au demandeur) :');
    if (raison) {
      this.certService.rejeterDemande(d.id, raison).subscribe(() => this.loadDemandes());
    }
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'CERTIFIEE': return 'bg-green-50 text-green-600';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-600';
      case 'PAYEE': return 'bg-blue-50 text-blue-600';
      case 'REJETEE': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  }
}
