import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GarageService } from '../../../garages/services/garage.service';
import { Garage } from '../../../garages/models/garage.model';
import { LucideAngularModule, Check, X, ShieldAlert, Building } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-garages',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './admin-garages.component.html'
})
export class AdminGaragesComponent implements OnInit {
  private garageService = inject(GarageService);
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
    if(confirm("Confirmer la validation de ce garage ? Il sera publiquement visible.")) {
      this.garageService.validerGarage(id, { nouveauStatut: 'ACTIF' }).subscribe(() => {
        this.loadGaragesEnAttente();
      });
    }
  }

  refuserGarage(id: string) {
    const reason = prompt("Raison du refus :");
    if(reason) {
      this.garageService.validerGarage(id, { nouveauStatut: 'REJETE', commentaireAdmin: reason }).subscribe(() => {
        this.loadGaragesEnAttente();
      });
    }
  }
}
