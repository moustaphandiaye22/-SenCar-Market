import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { LucideAngularModule, CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <div *ngFor="let toast of toastService.toasts()"
           class="flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border pointer-events-auto"
           [class.bg-green-50]="toast.type === 'success'"
           [class.border-green-100]="toast.type === 'success'"
           [class.bg-red-50]="toast.type === 'error'"
           [class.border-red-100]="toast.type === 'error'"
           [class.bg-blue-50]="toast.type === 'info'"
           [class.border-blue-100]="toast.type === 'info'"
           [class.bg-amber-50]="toast.type === 'warning'"
           [class.border-amber-100]="toast.type === 'warning'"
           style="animation: slideIn 0.25s ease-out">

        <lucide-angular *ngIf="toast.type === 'success'" [img]="icons.CheckCircle2" size="18"
                        class="text-green-600 flex-shrink-0 mt-0.5 block"></lucide-angular>
        <lucide-angular *ngIf="toast.type === 'error'" [img]="icons.XCircle" size="18"
                        class="text-red-600 flex-shrink-0 mt-0.5 block"></lucide-angular>
        <lucide-angular *ngIf="toast.type === 'info'" [img]="icons.Info" size="18"
                        class="text-blue-600 flex-shrink-0 mt-0.5 block"></lucide-angular>
        <lucide-angular *ngIf="toast.type === 'warning'" [img]="icons.AlertTriangle" size="18"
                        class="text-amber-600 flex-shrink-0 mt-0.5 block"></lucide-angular>

        <p class="text-sm font-medium flex-1 leading-snug"
           [class.text-green-800]="toast.type === 'success'"
           [class.text-red-800]="toast.type === 'error'"
           [class.text-blue-800]="toast.type === 'info'"
           [class.text-amber-800]="toast.type === 'warning'">
          {{ toast.message }}
        </p>

        <button (click)="toastService.dismiss(toast.id)"
                class="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5">
          <lucide-angular [img]="icons.X" size="14" class="block"
                          [class.text-green-700]="toast.type === 'success'"
                          [class.text-red-700]="toast.type === 'error'"
                          [class.text-blue-700]="toast.type === 'info'"
                          [class.text-amber-700]="toast.type === 'warning'"></lucide-angular>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
  icons = { CheckCircle2, XCircle, Info, AlertTriangle, X };
}
