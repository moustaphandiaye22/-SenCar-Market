import { Injectable, signal } from '@angular/core';

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  activeDialog = signal<ConfirmDialog | null>(null);

  show(dialog: ConfirmDialog) {
    this.activeDialog.set(dialog);
  }

  confirm() {
    const dialog = this.activeDialog();
    if (dialog) {
      dialog.onConfirm();
      this.activeDialog.set(null);
    }
  }

  cancel() {
    const dialog = this.activeDialog();
    if (dialog && dialog.onCancel) {
      dialog.onCancel();
    }
    this.activeDialog.set(null);
  }
}
