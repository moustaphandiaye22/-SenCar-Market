import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromptService } from '../../services/prompt.service';
import { LucideAngularModule, MessageCircle, X } from 'lucide-angular';

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div *ngIf="promptService.activeDialog() as dialog" 
         class="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
           (click)="promptService.cancel()"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        <!-- Decor -->
        <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-50 rounded-full -z-10"></div>
        
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <lucide-angular [img]="icons.MessageCircle" size="28"></lucide-angular>
          </div>
          <h3 class="text-2xl font-black text-gray-900 tracking-tight leading-tight">
            {{ dialog.title }}
          </h3>
        </div>
        
        <p class="text-gray-500 font-medium leading-relaxed mb-6">
          {{ dialog.message }}
        </p>

        <div class="mb-10">
          <input [(ngModel)]="value" 
                 [type]="dialog.inputType || 'text'"
                 [placeholder]="dialog.placeholder || ''"
                 class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                 (keyup.enter)="onConfirm()">
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button (click)="promptService.cancel()" 
                  class="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95">
            {{ dialog.cancelText || 'Annuler' }}
          </button>
          <button (click)="onConfirm()" 
                  [disabled]="!value"
                  class="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50">
            {{ dialog.confirmText || 'Valider' }}
          </button>
        </div>

        <button (click)="promptService.cancel()" 
                class="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
          <lucide-angular [img]="icons.X" size="20"></lucide-angular>
        </button>
      </div>
    </div>
  `
})
export class PromptDialogComponent {
  promptService = inject(PromptService);
  icons = { MessageCircle, X };

  get value(): string { return this.promptService.currentValue(); }
  set value(v: string) { this.promptService.currentValue.set(v); }

  onConfirm() {
    if (this.value) {
      this.promptService.confirm();
    }
  }
}
