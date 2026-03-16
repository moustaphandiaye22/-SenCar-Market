import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../../../core/services/avis.service';
import { LucideAngularModule, Star, Send } from 'lucide-angular';

@Component({
  selector: 'app-avis-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h3 class="text-xl font-bold text-gray-900 mb-6">Laisser un avis</h3>
      
      <div class="flex space-x-2 mb-6">
        <button *ngFor="let star of [1,2,3,4,5]" 
                (click)="setNote(star)"
                class="transition-transform hover:scale-125">
          <i-lucide [name]="icons.Star" 
                    class="w-8 h-8" 
                    [class.fill-amber-400]="star <= note"
                    [class.text-amber-400]="star <= note"
                    [class.text-gray-200]="star > note">
          </i-lucide>
        </button>
      </div>

      <textarea [(ngModel)]="commentaire" 
                rows="4" 
                placeholder="Partagez votre expérience..."
                class="w-full p-4 rounded-2xl border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none mb-4 text-gray-600">
      </textarea>

      <button (click)="submit()" 
              [disabled]="note === 0 || !commentaire || isSubmitting"
              class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100">
        <i-lucide [name]="icons.Send" class="w-5 h-5" *ngIf="!isSubmitting"></i-lucide>
        <span *ngIf="!isSubmitting">Envoyer l'avis</span>
        <span *ngIf="isSubmitting" class="animate-pulse">Envoi en cours...</span>
      </button>
    </div>
  `
})
export class AvisFormComponent {
  @Input() targetId!: string;
  @Input() typeAvis!: string;
  @Input() transactionId!: string;
  @Output() avisSent = new EventEmitter<any>();

  private avisService = inject(AvisService);
  
  note = 0;
  commentaire = '';
  isSubmitting = false;
  icons = { Star, Send };

  setNote(n: number) {
    this.note = n;
  }

  submit() {
    this.isSubmitting = true;
    const data = {
      note: this.note,
      commentaire: this.commentaire,
      typeAvis: this.typeAvis,
      cibleId: this.targetId,
      transactionId: this.transactionId
    };

    this.avisService.createAvis(data).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.avisSent.emit(res);
        this.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Erreur lors de l\'envoi de l\'avis');
      }
    });
  }

  private reset() {
    this.note = 0;
    this.commentaire = '';
  }
}
