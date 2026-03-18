import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, UserPlus, Mail, Lock, User, Phone, Briefcase, AlertCircle, MapPin, Calendar, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.pattern('^\\+221[7-9][0-9]{8}$')]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    typeUtilisateur: ['UTILISATEUR', Validators.required],
    adresse: [''],
    dateDeNaissance: ['']
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  icons = { UserPlus, Mail, Lock, User, Phone, Briefcase, AlertCircle, MapPin, Calendar, Eye, EyeOff };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        const email = this.registerForm.get('email')?.value;
        this.router.navigate(['/verify-otp'], { queryParams: { email }}); 
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Cette adresse email est déjà utilisée.';
        } else if (err.status === 400) {
          this.errorMessage = 'Veuillez vérifier les informations saisies.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription.';
        }
      }
    });
  }
}
