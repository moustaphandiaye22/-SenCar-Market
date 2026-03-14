import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Car, Calendar, DollarSign, Info, Save, X, Fuel, Gauge, Shield } from 'lucide-angular';
import { RentalService } from '../services/rental.service';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { VehiculeResponse } from '../../../core/models/vehicule.model';

@Component({
  selector: 'app-rental-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './rental-form.component.html'
})
export class RentalFormComponent implements OnInit {
  rentalForm: FormGroup;
  isEdit = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  rentalId?: string;
  mesVehicules: VehiculeResponse[] = [];

  readonly icons = {
    Car,
    Calendar,
    DollarSign,
    Info,
    Save,
    X,
    Fuel,
    Gauge,
    Shield
  };

  constructor(
    private fb: FormBuilder,
    private rentalService: RentalService,
    private vehiculeService: VehiculeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.rentalForm = this.fb.group({
      vehiculeId: ['', Validators.required],
      tarifJournalier: [25000, [Validators.required, Validators.min(5000)]],
      description: ['', Validators.required],
      conditions: ['', Validators.required],
      caution: [100000, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadMesVehicules();
    this.rentalId = this.route.snapshot.params['id'];
    if (this.rentalId && this.rentalId !== 'new') {
      this.isEdit = true;
      this.loadAnnonce(this.rentalId);
    }
  }

  loadMesVehicules(): void {
    this.vehiculeService.getMesVehicules().subscribe({
      next: (res) => {
        this.mesVehicules = res;
      },
      error: (err) => {
        console.error('Error loading my vehicles', err);
      }
    });
  }

  loadAnnonce(id: string): void {
    this.isLoading = true;
    this.rentalService.getAnnonceById(id).subscribe({
      next: (annonce) => {
        this.rentalForm.patchValue({
          vehiculeId: annonce.vehiculeId,
          tarifJournalier: annonce.tarifJournalier,
          description: annonce.description,
          conditions: annonce.conditions,
          caution: annonce.caution
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading rental', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.rentalForm.invalid) return;

    this.isLoading = true;
    const request = this.rentalForm.value;

    if (this.isEdit && this.rentalId) {
      this.rentalService.updateAnnonce(this.rentalId, request).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Votre annonce a été modifiée avec succès !';
          setTimeout(() => {
            this.router.navigate(['/locations']);
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating rental', err);
          this.isLoading = false;
        }
      });
    } else {
      this.rentalService.createAnnonce(request).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Votre annonce a été publiée avec succès !';
          setTimeout(() => {
            this.router.navigate(['/locations']);
          }, 3000);
        },
        error: (err) => {
          console.error('Error creating rental', err);
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la publication de l\'annonce.';
          this.isLoading = false;
        }
      });
    }
  }
}
