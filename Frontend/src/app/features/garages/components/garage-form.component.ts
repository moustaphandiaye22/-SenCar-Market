import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Phone, Building, Info, Save, X } from 'lucide-angular';
import { GarageService } from '../services/garage.service';

@Component({
  selector: 'app-garage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './garage-form.component.html'
})
export class GarageFormComponent implements OnInit {
  garageForm: FormGroup;
  isEdit = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  garageId?: string;

  readonly icons = {
    MapPin,
    Phone,
    Building,
    Info,
    Save,
    X
  };

  constructor(
    private fb: FormBuilder,
    private garageService: GarageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.garageForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      ville: ['', [Validators.required]],
      latitude: [14.7167],
      longitude: [-17.4677]
    });
  }

  ngOnInit(): void {
    this.garageId = this.route.snapshot.params['id'];
    if (this.garageId && this.garageId !== 'new') {
      this.isEdit = true;
      this.loadGarage(this.garageId);
    }
  }

  loadGarage(id: string): void {
    this.isLoading = true;
    this.garageService.getGarageById(id).subscribe({
      next: (garage) => {
        this.garageForm.patchValue(garage);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading garage', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.garageForm.invalid) return;

    this.isLoading = true;
    const request = this.garageForm.value;

    if (this.isEdit && this.garageId) {
      this.garageService.updateGarage(this.garageId, request).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Votre garage a été mis à jour avec succès !';
          setTimeout(() => {
            this.router.navigate(['/garages', this.garageId]);
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating garage', err);
          this.isLoading = false;
        }
      });
    } else {
      this.garageService.createGarage(request).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = 'Votre garage a été créé avec succès ! Il est actuellement en attente de validation par notre équipe.';
          setTimeout(() => {
            this.router.navigate(['/garages', res.id]);
          }, 4000);
        },
        error: (err) => {
          console.error('Error creating garage', err);
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la création du garage.';
          this.isLoading = false;
        }
      });
    }
  }
}
