import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Car, Info, Image, Check, AlertCircle, X, Plus, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './vehicule-form.component.html'
})
export class VehiculeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculeService = inject(VehiculeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vehiculeForm: FormGroup = this.fb.group({
    marque: ['', Validators.required],
    modele: ['', Validators.required],
    anneeFabrication: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    kilometrage: [0, [Validators.required, Validators.min(0)]],
    carburantId: ['', Validators.required],
    boiteVitesseId: ['', Validators.required],
    couleur: ['', Validators.required],
    prixVente: ['', [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    numeroVin: ['', Validators.required],
    immatriculation: [''],
    titre: [''],
    nombrePortes: [5, [Validators.min(1)]],
    nombrePlaces: [5, [Validators.min(1)]],
    cylindree: [''],
    puissanceFiscale: [''],
    estGarantie: [false],
    garantieMois: [0, [Validators.min(0)]],
    prixNegociable: [false],
    certifie: [false],
    enregistrerEnBrouillon: [false],
    photosUrls: [[]]
  });

  isEditMode = false;
  vehiculeId: string | null = null;
  isLoading = false;
  submitting = false;
  errorMessage = '';
  
  icons = { Car, Info, Image, Check, AlertCircle, X, Plus, ArrowRight };

  marques: any[] = [];
  modeles: any[] = [];
  carburants: any[] = [];
  boites: any[] = [];
  
  hasError(controlName: string, errorType: string): boolean {
    const control = this.vehiculeForm.get(controlName);
    return !!(control && control.hasError(errorType) && (control.touched || control.dirty));
  }

  ngOnInit(): void {
    this.loadReferences();
    this.vehiculeId = this.route.snapshot.paramMap.get('id');
    if (this.vehiculeId) {
      this.isEditMode = true;
      this.loadVehicule();
    }
  }

  loadReferences(): void {
    this.vehiculeService.getCarburants().subscribe(data => this.carburants = data);
    this.vehiculeService.getBoiteVitesses().subscribe(data => this.boites = data);
  }

  onMarqueChange(): void {
    // Plus besoin de ça car on le tape en texte
  }

  onPhotosChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.vehiculeService.uploadPhotos(Array.from(files)).subscribe({
        next: (urls: string[]) => {
          const currentPhotos = this.vehiculeForm.get('photosUrls')?.value || [];
          this.vehiculeForm.get('photosUrls')?.setValue([...currentPhotos, ...urls]);
          // Reset file input
          event.target.value = '';
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.errorMessage = "Erreur lors de l'upload des photos";
        }
      });
    }
  }

  removePhoto(index: number): void {
    const currentPhotos = this.vehiculeForm.get('photosUrls')?.value || [];
    currentPhotos.splice(index, 1);
    this.vehiculeForm.get('photosUrls')?.setValue(currentPhotos);
  }

  loadVehicule(): void {
    if (!this.vehiculeId) return;
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(this.vehiculeId).subscribe({
      next: (vehicule) => {
        // Map backend fields to form fields if they differ
        const formData = {
           marque: vehicule.marque || '',
           modele: vehicule.modele || '',
           anneeFabrication: vehicule.anneeFabrication,
           kilometrage: vehicule.kilometrage,
           carburantId: vehicule.carburantId || '',
           boiteVitesseId: vehicule.boiteVitesseId || '',
           couleur: vehicule.couleur,
           prixVente: vehicule.prixVente,
           description: vehicule.description,
           numeroVin: vehicule.numeroVin,
           immatriculation: vehicule.immatriculation,
           titre: vehicule.titre || '',
           nombrePortes: vehicule.nombrePortes || 5,
           nombrePlaces: vehicule.nombrePlaces || 5,
           cylindree: vehicule.cylindree || '',
           puissanceFiscale: vehicule.puissanceFiscale || '',
           estGarantie: vehicule.estGarantie || false,
           garantieMois: vehicule.garantieMois || 0,
           prixNegociable: vehicule.prixNegociable,
           certifie: vehicule.certifie,
           enregistrerEnBrouillon: vehicule.statut === 'BROUILLON',
           photosUrls: vehicule.photosUrls || []
        };
        
        this.vehiculeForm.patchValue(formData);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicle', error);
        this.errorMessage = 'Impossible de charger les données du véhicule.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.invalid) {
      this.vehiculeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const data = this.vehiculeForm.value;
    
    const obs = this.isEditMode && this.vehiculeId
      ? this.vehiculeService.updateVehicule(this.vehiculeId, data)
      : this.vehiculeService.createVehicule(data);

    obs.subscribe({
      next: (response) => {
        this.submitting = false;
        this.router.navigate(['/vehicles', response.id]);
      },
      error: (error) => {
        console.error('Error saving vehicle', error);
        this.errorMessage = "Une erreur est survenue lors de l'enregistrement de l'annonce. Verifiez que tous les champs sont valides.";
        this.submitting = false;
      }
    });
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
