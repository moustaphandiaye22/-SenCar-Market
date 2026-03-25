import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AssuranceService,
  ProduitAssurance,
} from '../../services/assurance.service';
import {
  LucideAngularModule,
  Shield,
  Check,
  Info,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Car,
  X,
  Loader2,
} from 'lucide-angular';
import { VehiculeService } from '../../../../core/services/vehicule.service';
import { VehiculeResponse } from '../../../../core/models/vehicule.model';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import {
  TypeAssurance,
  TypeAssuranceLabels,
} from '../../../../core/models/enums.model';

@Component({
  selector: 'app-assurance-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './assurance-list.component.html',
})
export class AssuranceListComponent implements OnInit {
  private assuranceService = inject(AssuranceService);
  private vehiculeService = inject(VehiculeService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  produits: ProduitAssurance[] = [];
  mesVehicules: VehiculeResponse[] = [];
  isLoading = true;
  isSubscribing = false;
  showVehicleSelection = false;
  selectedProduit: ProduitAssurance | null = null;

  icons = {
    Shield,
    Check,
    Info,
    ArrowRight,
    ShieldCheck,
    HeartPulse,
    Car,
    X,
    Loader2,
  };

  ngOnInit() {
    this.loadProduits();
    this.loadMesVehicules();
  }

  loadProduits() {
    this.assuranceService.getProduitsActifs().subscribe({
      next: (res) => {
        this.produits = res;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  loadMesVehicules() {
    this.vehiculeService.getMesVehicules().subscribe({
      next: (res) => (this.mesVehicules = res),
      error: (err) => {
        console.error('Error loading user vehicles:', err);
        this.mesVehicules = [];
      },
    });
  }

  openSubscription(produit: ProduitAssurance) {
    if (!this.authService.isAuthenticated) {
      this.toast.info(
        'Veuillez vous connecter pour souscrire à une assurance.',
      );
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/assurance' },
      });
      return;
    }

    console.log('Button clicked for product:', produit.nom);
    this.selectedProduit = produit;
    if (this.mesVehicules.length === 0) {
      console.log('No vehicles found for user');
      this.toast.warning(
        "Vous n'avez aucun véhicule enregistré. Créez une annonce pour pouvoir y souscrire une assurance.",
      );
      return;
    }
    this.showVehicleSelection = true;
  }

  confirmSubscription(vehiculeId: string) {
    if (!this.selectedProduit) return;

    this.isSubscribing = true;
    const data = {
      vehiculeId,
      produitAssuranceId: this.selectedProduit.id,
      optionIds: [], // Options can be added later
    };

    this.assuranceService.createSouscription(data).subscribe({
      next: (res) => {
        this.toast.success('Demande de souscription créée avec succès !');
        this.showVehicleSelection = false;
        this.isSubscribing = false;
        // Navigate to payment or dashboard
        this.router.navigate(['/dashboard'], {
          queryParams: { tab: 'assurance' },
        });
      },
      error: (err) => {
        this.toast.error(
          'Erreur lors de la souscription : ' +
            (err.error?.message || 'Erreur technique'),
        );
        this.isSubscribing = false;
      },
    });
  }

  getIcon(type: string) {
    if (type.includes('AUTO')) return this.icons.Car;
    if (type.includes('VIE')) return this.icons.HeartPulse;
    return this.icons.Shield;
  }

  getTypeLabel(type: string): string {
    return TypeAssuranceLabels[type as TypeAssurance] || type;
  }
}
