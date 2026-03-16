import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { LucideAngularModule, Megaphone, Send } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main Form -->
        <div class="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <lucide-angular [img]="icons.Megaphone" size="24"></lucide-angular>
            </div>
            <div>
              <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Notification Groupée</h2>
              <p class="text-gray-500 mt-1">Diffusez un message important à toute la communauté.</p>
            </div>
          </div>
          
          <div class="space-y-8">
            <div class="group">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Titre de l'alerte</label>
              <input [(ngModel)]="titre" 
                     type="text" 
                     placeholder="Ex: Mise à jour majeure du système"
                     class="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all duration-300">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Message de diffusion</label>
              <textarea [(ngModel)]="message" 
                        rows="6" 
                        placeholder="Détaillez votre annonce ici..."
                        class="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-sm font-medium text-gray-600 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all duration-300 resize-none leading-relaxed"></textarea>
            </div>

            <button (click)="send()" 
                    [disabled]="!titre || !message || isSending"
                    class="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black hover:shadow-2xl hover:shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100">
              <lucide-angular [img]="icons.Send" size="18" *ngIf="!isSending"></lucide-angular>
              <span *ngIf="!isSending">Lancer la diffusion</span>
              <span *ngIf="isSending" class="flex items-center gap-2">
                <span class="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </button>
            
            <div *ngIf="successMessage" class="p-4 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {{ successMessage }}
            </div>
          </div>
        </div>

        <!-- Live Preview -->
        <div class="lg:w-80 flex flex-col gap-6">
          <div class="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <h3 class="text-xs font-black uppercase tracking-widest text-primary-400 mb-6 flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse"></span>
              Aperçu en direct
            </h3>

            <div class="bg-white/5 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/10">
              <div class="flex items-center gap-3 mb-3 text-primary-400">
                <lucide-angular [img]="icons.Megaphone" size="14"></lucide-angular>
                <span class="text-[10px] font-black uppercase tracking-widest">Notification</span>
              </div>
              <p class="font-black text-sm mb-2 line-clamp-2" [class.opacity-30]="!titre">
                {{ titre || 'Titre de la notification' }}
              </p>
              <p class="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-4" [class.opacity-30]="!message">
                {{ message || 'Le contenu de votre message apparaîtra ici tel qu\\'il sera vu par les utilisateurs.' }}
              </p>
              <div class="mt-4 flex justify-end">
                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                   <lucide-angular [img]="icons.Send" size="12" class="opacity-40"></lucide-angular>
                </div>
              </div>
            </div>

            <div class="mt-8 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center leading-loose italic">
              Cette notification sera envoyée par push et e-mail à tous les comptes actifs.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminBroadcastComponent {
  private adminService = inject(AdminService);
  
  titre = '';
  message = '';
  isSending = false;
  successMessage = '';
  icons = { Megaphone, Send };

  send() {
    this.isSending = true;
    this.adminService.notifierTous(this.titre, this.message).subscribe({
      next: () => {
        this.isSending = false;
        this.successMessage = 'Diffusion terminée avec succès !';
        this.titre = '';
        this.message = '';
        setTimeout(() => this.successMessage = '', 6000);
      },
      error: (err) => {
        this.isSending = false;
        alert('Échec de la diffusion. Veuillez vérifier votre connexion.');
      }
    });
  }
}
