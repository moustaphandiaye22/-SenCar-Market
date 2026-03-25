import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Zap } from 'lucide-angular';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './verify-otp.component.html'
})
export class VerifyOtpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  email = '';
  isLoading = false;
  isResending = false;
  isAutoFilling = false;
  errorMessage = '';
  successMessage = '';
  isDev = !environment.production;
  
  icons = { ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Zap };

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/login']);
    }
  }

  /** DEV ONLY — Récupère et auto-remplit le code OTP depuis la BD */
  autoFillOtp() {
    if (environment.production) return;
    this.isAutoFilling = true;
    this.errorMessage = '';

    this.authService.devGetOtp(this.email).subscribe({
      next: (res) => {
        this.isAutoFilling = false;
        this.otpForm.get('otp')?.setValue(res.code);
        this.successMessage = `Code OTP récupéré automatiquement : ${res.code}`;
      },
      error: () => {
        this.isAutoFilling = false;
        this.errorMessage = 'Impossible de récupérer le code. Vérifie que tu as bien un OTP en attente en BD.';
      }
    });
  }

  onSubmit() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const codeOtp = this.otpForm.get('otp')?.value;

    this.authService.verifyOtp(this.email, codeOtp).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Votre compte a été vérifié avec succès !';
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { verified: 'true' }});
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.errorMessage = 'Le code OTP est invalide ou a expiré.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la vérification.';
        }
      }
    });
  }

  resendOtp() {
    this.isResending = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.successMessage = 'Un nouveau code a été envoyé à votre adresse email.';
      },
      error: () => {
        this.isResending = false;
        this.errorMessage = 'Impossible de renvoyer le code. Veuillez réessayer plus tard.';
      }
    });
  }
}
