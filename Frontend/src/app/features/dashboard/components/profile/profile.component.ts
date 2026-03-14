import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, User, Mail, Phone, Lock, Save, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-3 bg-primary-100 rounded-2xl">
          <lucide-angular [img]="icons.User" class="text-primary-600" size="32"></lucide-angular>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900">Mon Profil</h2>
          <p class="text-gray-500 text-sm font-medium">Gérez vos informations personnelles et la sécurité de votre compte.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Informations Personnelles -->
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <lucide-angular [img]="icons.User" size="20" class="text-primary-600"></lucide-angular>
              Informations Personnelles
            </h3>

            <form (ngSubmit)="updateProfile()" #profileForm="ngForm" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Prénom</label>
                  <input type="text" [(ngModel)]="profile.prenom" name="prenom" required
                         class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-gray-900">
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nom</label>
                  <input type="text" [(ngModel)]="profile.nom" name="nom" required
                         class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-gray-900">
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email (Non modifiable)</label>
                <div class="relative">
                  <lucide-angular [img]="icons.Mail" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
                  <input type="email" [value]="profile.email" disabled
                         class="w-full pl-12 pr-5 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-gray-500 font-medium cursor-not-allowed">
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Téléphone</label>
                <div class="relative">
                  <lucide-angular [img]="icons.Phone" size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></lucide-angular>
                  <input type="tel" [(ngModel)]="profile.telephone" name="telephone"
                         class="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-gray-900">
                </div>
              </div>

              <div class="pt-4 flex justify-end">
                <button type="submit" [disabled]="isSaving"
                        class="flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 group">
                  <lucide-angular [img]="icons.Save" size="20" *ngIf="!isSaving"></lucide-angular>
                  <lucide-angular [img]="icons.RefreshCw" size="20" class="animate-spin" *ngIf="isSaving"></lucide-angular>
                  <span>Mettre à jour</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Sécurité / Mot de passe -->
          <div class="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <lucide-angular [img]="icons.Lock" size="20" class="text-primary-600"></lucide-angular>
              Changer le mot de passe
            </h3>

            <form (ngSubmit)="changePassword()" #pwdForm="ngForm" class="space-y-4">
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Ancien mot de passe</label>
                  <input type="password" [(ngModel)]="pwdData.ancienMotDePasse" name="old" required
                         class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-gray-900">
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nouveau mot de passe</label>
                  <input type="password" [(ngModel)]="pwdData.nouveauMotDePasse" name="new" required
                         class="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-gray-900">
                </div>
              </div>

              <div class="pt-2 flex justify-end">
                <button type="submit" [disabled]="isChangingPwd || !pwdForm.valid"
                        class="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar / Statut -->
        <div class="space-y-6">
          <div class="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-200">
            <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black mb-6">
              {{ profile.prenom[0] }}{{ profile.nom[0] }}
            </div>
            <h4 class="text-xl font-black mb-1">{{ profile.prenom }} {{ profile.nom }}</h4>
            <p class="text-gray-400 text-sm font-medium mb-6">{{ profile.role }}</p>
            
            <div class="pt-6 border-t border-white/10 space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Compte vérifié</span>
                <span class="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-lg font-bold text-[10px] uppercase">Oui</span>
              </div>
            </div>
          </div>

          <div class="bg-red-50 rounded-3xl p-6 border border-red-100">
            <h4 class="text-red-900 font-bold mb-2">Zone de danger</h4>
            <p class="text-red-700 text-xs font-medium mb-4">La suppression de votre compte est définitive et entraînera la perte de toutes vos données.</p>
            <button class="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all">
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  
  profile: any = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    role: ''
  };

  isSaving = false;
  isChangingPwd = false;
  icons = { User, Mail, Phone, Lock, Save, RefreshCw };

  pwdData = {
    ancienMotDePasse: '',
    nouveauMotDePasse: ''
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getMe().subscribe(user => {
      this.profile = { ...user };
    });
  }

  updateProfile() {
    this.isSaving = true;
    this.authService.updateProfile({
      prenom: this.profile.prenom,
      nom: this.profile.nom,
      telephone: this.profile.telephone
    }).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Profil mis à jour avec succès !');
      },
      error: () => {
        this.isSaving = false;
        alert('Erreur lors de la mise à jour.');
      }
    });
  }

  changePassword() {
    this.isChangingPwd = true;
    this.authService.changePassword(this.pwdData).subscribe({
      next: () => {
        this.isChangingPwd = false;
        this.pwdData = { ancienMotDePasse: '', nouveauMotDePasse: '' };
        alert('Mot de passe mis à jour !');
      },
      error: (err: any) => {
        this.isChangingPwd = false;
        alert(err.error?.message || 'Erreur lors du changement de mot de passe.');
      }
    });
  }

  forgotPassword() {
    this.authService.forgotPassword(this.profile.email).subscribe(() => {
      alert('Un code de réinitialisation vous a été envoyé par email.');
    });
  }
}
