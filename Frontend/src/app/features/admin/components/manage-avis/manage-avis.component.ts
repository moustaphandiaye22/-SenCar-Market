import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService, Avis } from '../../../../core/services/avis.service';
import { LucideAngularModule, MessageSquare, Trash2, Star, User, Calendar, ShieldAlert, Search, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-avis',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Modération des Avis</h2>
          <p class="text-gray-500 mt-1">Supervisez les retours d'expérience et maintenez la qualité.</p>
        </div>
        <div class="relative w-full md:w-72">
          <lucide-angular [img]="icons.Search" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
          <input type="text" 
                 [(ngModel)]="searchQuery" 
                 (input)="filterAvis()"
                 placeholder="Filtrer les commentaires..." 
                 class="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all">
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-primary-600"></div>
      </div>

      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let avis of filteredAvis" 
             class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl group flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                  {{ (avis.auteur?.prenom?.[0] || 'U') }}
                </div>
                <div>
                  <p class="text-sm font-black text-gray-900">{{ avis.auteur?.prenom }} {{ avis.auteur?.nom }}</p>
                  <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">{{ avis.typeAvis }}</p>
                </div>
              </div>
              <div class="flex gap-0.5">
                <lucide-angular *ngFor="let i of [1,2,3,4,5]" 
                               [img]="icons.Star" 
                               size="10" 
                               [class.text-amber-400]="i <= avis.note"
                               [class.fill-amber-400]="i <= avis.note"
                               [class.text-gray-100]="i > avis.note">
                </lucide-angular>
              </div>
            </div>

            <p class="text-gray-600 text-sm italic leading-relaxed mb-6">"{{ avis.commentaire }}"</p>
          </div>

          <div class="flex justify-between items-center pt-6 border-t border-gray-50/50">
            <span class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <lucide-angular [img]="icons.Calendar" size="12"></lucide-angular>
              {{ avis.dateCreation | date:'dd MMM yyyy' }}
            </span>
            <button (click)="supprimer(avis)"
                    title="Supprimer définitivement cet avis"
                    class="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95">
              <lucide-angular [img]="icons.Trash2" size="18"></lucide-angular>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && filteredAvis.length === 0" class="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <lucide-angular [img]="icons.MessageSquare" size="32" class="text-gray-200"></lucide-angular>
        </div>
        <p class="text-gray-400 font-bold uppercase tracking-widest">Aucun avis trouvé</p>
        <p class="text-gray-300 text-sm mt-2">Votre recherche ne correspond à aucun commentaire.</p>
      </div>
    </div>
  `
})
export class ManageAvisComponent implements OnInit {
  private avisService = inject(AvisService);
  avisList: Avis[] = [];
  filteredAvis: Avis[] = [];
  searchQuery = '';
  isLoading = true;
  icons = { MessageSquare, Trash2, Star, User, Calendar, ShieldAlert, Search, Filter };

  ngOnInit() {
    this.loadAvis();
  }

  loadAvis() {
    this.isLoading = true;
    this.avisService.getAllAvis(0, 50).subscribe({
      next: (res) => {
        this.avisList = res.content;
        this.filterAvis();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading avis', err);
        this.isLoading = false;
      }
    });
  }

  filterAvis() {
    if (!this.searchQuery) {
      this.filteredAvis = this.avisList;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredAvis = this.avisList.filter(a => 
        a.commentaire.toLowerCase().includes(q) || 
        (a.auteur?.prenom && a.auteur.prenom.toLowerCase().includes(q)) ||
        (a.auteur?.nom && a.auteur.nom.toLowerCase().includes(q))
      );
    }
  }

  supprimer(avis: Avis) {
    if (confirm('Voulez-vous vraiment supprimer cet avis ? Cette action est irréversible.')) {
      this.avisService.deleteAvis(avis.id).subscribe(() => {
        this.loadAvis();
      });
    }
  }
}
