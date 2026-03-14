import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Car, Gauge, Calendar, Shield, Info, ArrowRight, CheckCircle, AlertCircle } from 'lucide-angular';
import { TradeInService } from '../services/trade-in.service';
import { Estimation } from '../models/trade-in.model';

@Component({
  selector: 'app-trade-in-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './trade-in-form.component.html'
})
export class TradeInFormComponent {
  tradeInForm: FormGroup;
  estimation?: Estimation;
  isEstimating = false;
  isSubmitting = false;
  step = 1;
  success = false;

  readonly icons = {
    Car,
    Gauge,
    Calendar,
    Shield,
    Info,
    ArrowRight,
    CheckCircle,
    AlertCircle
  };

  constructor(
    private fb: FormBuilder,
    private tradeInService: TradeInService,
    private router: Router
  ) {
    this.tradeInForm = this.fb.group({
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      anneeFabrication: [2020, [Validators.required, Validators.min(1990), Validators.max(2026)]],
      kilometrage: [50000, [Validators.required, Validators.min(0)]],
      etatVehicule: ['BON', Validators.required],
      description: ['']
    });
  }

  nextStep(): void {
    if (this.step === 1 && this.tradeInForm.valid) {
      this.calculateEstimation();
    } else if (this.step === 2) {
      this.submitDemande();
    }
  }

  calculateEstimation(): void {
    this.isEstimating = true;
    this.tradeInService.estimerVehicule(this.tradeInForm.value).subscribe({
      next: (res) => {
        this.estimation = res;
        this.isEstimating = false;
        this.step = 2;
      },
      error: (err) => {
        console.error('Estimation error', err);
        this.isEstimating = false;
      }
    });
  }

  submitDemande(): void {
    this.isSubmitting = true;
    this.tradeInService.createDemande(this.tradeInForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
        this.step = 3;
      },
      error: (err) => {
        console.error('Submission error', err);
        this.isSubmitting = false;
      }
    });
  }

  formatPrice(price: number | string): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Number(price));
  }
}
