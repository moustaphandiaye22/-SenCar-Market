import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationService, DemandeCertification } from '../../../../core/services/certification.service';
import { LucideAngularModule, ShieldCheck, Clock, CheckCircle, XCircle, FileText } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-certification-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center">
          <i-lucide [name]="icons.ShieldCheck" class="w-6 h-6 mr-2 text-blue-600"></i-lucide>
          Mes Demandes de Certification
        </h1>
      </div>

      <div *ngIf="isLoading" class="flex justify-center p-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!isLoading && demandes.length === 0" class="text-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <p class="text-gray-500">Vous n'avez aucune demande de certification en cours.</p>
      </div>

      <div class="grid gap-4">
        <div *ngFor="let demande of demandes" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="p-3 rounded-xl" [ngClass]="getStatusBg(demande.statut)">
              <i-lucide [name]="getStatusIcon(demande.statut)" class="w-6 h-6" [ngClass]="getStatusColor(demande.statut)"></i-lucide>
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Véhicule ID: {{ demande.vehiculeId | slice:0:8 }}...</h3>
              <p class="text-sm text-gray-500">Soumis le {{ demande.dateCreation | date:'mediumDate' }}</p>
            </div>
          </div>
          
          <div class="text-right">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" [ngClass]="getStatusBadgeClass(demande.statut)">
              {{ demande.statut }}
            </span>
            <p class="text-sm font-bold text-gray-900 mt-1">{{ demande.montantPaiement }} FCFA</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CertificationListComponent implements OnInit {
  private certificationService = inject(CertificationService);
  private authService = inject(AuthService);
  demandes: DemandeCertification[] = [];
  isLoading = true;
  icons = { ShieldCheck, Clock, CheckCircle, XCircle, FileText };

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.loadDemandes(user.id);
      }
    });
  }

  loadDemandes(userId: string) {
    this.isLoading = true;
    this.certificationService.getDemandesByUtilisateur(userId).subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getStatusIcon(statut: string) {
    switch (statut) {
      case 'CERTIFIEE': return this.icons.CheckCircle;
      case 'REJETEE': return this.icons.XCircle;
      case 'PAYEE': return this.icons.Clock;
      default: return this.icons.FileText;
    }
  }

  getStatusColor(statut: string) {
    switch (statut) {
      case 'CERTIFIEE': return 'text-green-600';
      case 'REJETEE': return 'text-red-600';
      case 'PAYEE': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  }

  getStatusBg(statut: string) {
    switch (statut) {
      case 'CERTIFIEE': return 'bg-green-50';
      case 'REJETEE': return 'bg-red-50';
      case 'PAYEE': return 'bg-blue-50';
      default: return 'bg-gray-50';
    }
  }

  getStatusBadgeClass(statut: string) {
    switch (statut) {
      case 'CERTIFIEE': return 'bg-green-100 text-green-800';
      case 'REJETEE': return 'bg-red-100 text-red-800';
      case 'PAYEE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
