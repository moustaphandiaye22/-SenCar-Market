import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Lock, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    codeOtp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  
  icons = { Lock, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Eye, EyeOff };

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.resetForm.get('email')?.setValue(email);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('nouveauMotDePasse')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, codeOtp, nouveauMotDePasse } = this.resetForm.value;

    this.authService.resetPassword({ email, codeOtp, nouveauMotDePasse }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Votre mot de passe a été réinitialisé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { resetSuccess: 'true' }});
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.errorMessage = 'Le code OTP est invalide ou a expiré.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}
