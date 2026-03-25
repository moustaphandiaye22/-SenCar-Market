import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService, Avis } from '../../../../core/services/avis.service';
import { LucideAngularModule, Star, MessageSquare, User } from 'lucide-angular';

@Component({
  selector: 'app-avis-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div *ngIf="isLoading" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!isLoading && avisList.length === 0" class="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <i-lucide [name]="icons.MessageSquare" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i-lucide>
        <p class="text-gray-500">Aucun avis pour le moment.</p>
      </div>

      <div *ngFor="let avis of avisList" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-full">
              <i-lucide [name]="icons.User" class="w-5 h-5"></i-lucide>
            </div>
            <div>
              <h4 class="font-bold text-gray-900">{{ avis.auteur?.prenom }} {{ avis.auteur?.nom }}</h4>
              <p class="text-xs text-gray-400 font-medium">{{ avis.dateCreation | date:'longDate' }}</p>
            </div>
          </div>
          <div class="flex text-amber-400">
            <i-lucide 
              *ngFor="let star of [1,2,3,4,5]" 
              [name]="icons.Star" 
              class="w-4 h-4" 
              [class.fill-current]="star <= avis.note"
              [class.text-gray-200]="star > avis.note"
            ></i-lucide>
          </div>
        </div>
        <p class="text-gray-600 leading-relaxed">{{ avis.commentaire }}</p>
      </div>
    </div>
  `
})
export class AvisListComponent implements OnInit {
  @Input() targetId!: string;
  @Input() type: 'vehicule' | 'garage' | 'utilisateur' = 'vehicule';

  private avisService = inject(AvisService);
  avisList: Avis[] = [];
  isLoading = true;
  icons = { Star, MessageSquare, User };

  ngOnInit() {
    this.loadAvis();
  }

  loadAvis() {
    this.isLoading = true;
    let obs$;
    if (this.type === 'vehicule') {
      obs$ = this.avisService.getAvisByVehicule(this.targetId);
    } else if (this.type === 'garage') {
      obs$ = this.avisService.getAvisByGarage(this.targetId);
    } else {
      obs$ = this.avisService.getAvisByUtilisateur(this.targetId);
    }

    obs$.subscribe({
      next: (res) => {
        this.avisList = res.content;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
