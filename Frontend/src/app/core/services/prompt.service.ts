import { Injectable, signal } from '@angular/core';

export interface PromptDialog {
  title: string;
  message: string;
  placeholder?: string;
  inputType?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

@Injectable({ providedIn: 'root' })
export class PromptService {
  activeDialog = signal<PromptDialog | null>(null);
  currentValue = signal<string>('');

  show(dialog: PromptDialog) {
    this.currentValue.set('');
    this.activeDialog.set(dialog);
  }

  confirm() {
    const dialog = this.activeDialog();
    if (dialog) {
      dialog.onConfirm(this.currentValue());
      this.activeDialog.set(null);
    }
  }

  cancel() {
    this.activeDialog.set(null);
  }
}
