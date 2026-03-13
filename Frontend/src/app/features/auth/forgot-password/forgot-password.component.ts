import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  icons = { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft };

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Si un compte existe pour cet email, un code de réinitialisation vous a été envoyé.';
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { queryParams: { email }});
        }, 3000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }
}
