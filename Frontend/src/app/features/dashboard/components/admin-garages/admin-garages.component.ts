import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GarageService } from '../../../garages/services/garage.service';
import { Garage } from '../../../garages/models/garage.model';
import { ToastService } from '../../../../core/services/toast.service';
import { LucideAngularModule, Check, X, ShieldAlert, Building } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PromptService } from '../../../../core/services/prompt.service';

@Component({
  selector: 'app-admin-garages',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './admin-garages.component.html'
})
export class AdminGaragesComponent implements OnInit {
  private garageService = inject(GarageService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private promptService = inject(PromptService);
  garages: Garage[] = [];
  isLoading = true;

  icons = { Check, X, ShieldAlert, Building };

  ngOnInit() {
    this.loadGaragesEnAttente();
  }

  loadGaragesEnAttente() {
    this.isLoading = true;
    this.garageService.getGaragesEnAttente(0, 50).subscribe({
      next: (res: any) => {
        this.garages = res.content;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  validerGarage(id: string) {
    this.confirmService.show({
      title: 'Valider ce garage ?',
      message: 'Une fois validé, ce garage sera visible par tous les utilisateurs de la plateforme.',
      confirmText: 'Valider',
      cancelText: 'Plus tard',
      onConfirm: () => {
        this.garageService.validerGarage(id, { nouveauStatut: 'ACTIF' }).subscribe(() => {
          this.toastService.success('Garage validé avec succès !');
          this.loadGaragesEnAttente();
        });
      }
    });
  }

  refuserGarage(id: string) {
    this.promptService.show({
      title: 'Refuser le garage',
      message: 'Veuillez indiquer la raison du refus pour informer le propriétaire.',
      placeholder: 'Ex: Documents incomplets, coordonnées invalides...',
      confirmText: 'Confirmer le refus',
      cancelText: 'Annuler',
      onConfirm: (reason) => {
        if (reason) {
          this.garageService.validerGarage(id, { nouveauStatut: 'REJET', commentaireAdmin: reason }).subscribe(() => {
            this.toastService.warning('Inscription du garage refusée');
            this.loadGaragesEnAttente();
          });
        }
      }
    });
  }
}
