import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div *ngIf="confirmService.activeDialog() as dialog" 
         class="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
           (click)="confirmService.cancel()"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        <!-- Decor -->
        <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-50 rounded-full -z-10"></div>
        
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <lucide-angular [img]="icons.AlertTriangle" size="28"></lucide-angular>
          </div>
          <h3 class="text-2xl font-black text-gray-900 tracking-tight leading-tight">
            {{ dialog.title }}
          </h3>
        </div>
        
        <p class="text-gray-500 font-medium leading-relaxed mb-10">
          {{ dialog.message }}
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button (click)="confirmService.cancel()" 
                  class="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95">
            {{ dialog.cancelText || 'Annuler' }}
          </button>
          <button (click)="confirmService.confirm()" 
                  class="flex-1 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95">
            {{ dialog.confirmText || 'Confirmer' }}
          </button>
        </div>

        <button (click)="confirmService.cancel()" 
                class="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
          <lucide-angular [img]="icons.X" size="20"></lucide-angular>
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);
  icons = { AlertTriangle, X };
}
