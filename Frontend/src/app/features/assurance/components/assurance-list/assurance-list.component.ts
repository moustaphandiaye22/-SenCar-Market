import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssuranceService, ProduitAssurance } from '../../services/assurance.service';
import { LucideAngularModule, Shield, Check, Info, ArrowRight, ShieldCheck, HeartPulse, Car } from 'lucide-angular';

@Component({
  selector: 'app-assurance-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './assurance-list.component.html'
})
export class AssuranceListComponent implements OnInit {
  private assuranceService = inject(AssuranceService);

  produits: ProduitAssurance[] = [];
  isLoading = true;
  icons = { Shield, Check, Info, ArrowRight, ShieldCheck, HeartPulse, Car };

  ngOnInit() {
    this.loadProduits();
  }

  loadProduits() {
    this.assuranceService.getProduitsActifs().subscribe({
      next: (res) => {
        this.produits = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getIcon(type: string) {
    if (type.includes('AUTO')) return this.icons.Car;
    if (type.includes('VIE')) return this.icons.HeartPulse;
    return this.icons.Shield;
  }
}
