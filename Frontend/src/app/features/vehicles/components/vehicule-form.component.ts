import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { environment } from '../../../../environments/environment';
import {
  LucideAngularModule,
  Car,
  Info,
  Image,
  Check,
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  MapPin,
  Phone,
  Building,
  Save,
  Clock,
  Mail,
  Globe,
  Upload,
  Trash2,
  Tag,
  Calendar,
  Milestone,
  Fuel,
  Settings,
  Layers,
  Hash,
  ShieldCheck,
  Zap,
} from 'lucide-angular';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './vehicule-form.component.html',
})
export class VehiculeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculeService = inject(VehiculeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vehiculeForm: FormGroup = this.fb.group({
    marque: ['', [Validators.required, Validators.minLength(2)]],
    modele: ['', [Validators.required, Validators.minLength(1)]],
    anneeFabrication: [
      new Date().getFullYear(),
      [
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear() + 1),
      ],
    ],
    kilometrage: [0, [Validators.required, Validators.min(0)]],
    carburantId: ['', Validators.required],
    boiteVitesseId: ['', Validators.required],
    couleur: ['', Validators.required],
    prixVente: ['', [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    numeroVin: ['', [Validators.required, Validators.minLength(17)]], // VIN is usually 17 chars
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
    photosUrls: [[]],
  });

  isEditMode = false;
  vehiculeId: string | null = null;
  isLoading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  currentStep = 1;
  photoPreviews: string[] = [];

  readonly icons = {
    Car,
    Info,
    Image,
    Check,
    AlertCircle,
    X,
    Plus,
    ArrowRight,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    MapPin,
    Phone,
    Building,
    Save,
    Clock,
    Mail,
    Globe,
    Upload,
    Trash2,
    Tag,
    Calendar,
    Milestone,
    Fuel,
    Settings,
    Layers,
    Hash,
    ShieldCheck,
    Zap,
  };

  marques: any[] = [];
  modeles: any[] = [];
  carburants: any[] = [];
  boites: any[] = [];

  hasError(controlName: string, errorType: string): boolean {
    const control = this.vehiculeForm.get(controlName);
    return !!(
      control &&
      control.hasError(errorType) &&
      (control.touched || control.dirty)
    );
  }

  ngOnInit(): void {
    this.loadReferences();
    this.vehiculeId = this.route.snapshot.paramMap.get('id');
    if (this.vehiculeId && this.vehiculeId !== 'new') {
      this.isEditMode = true;
      this.loadVehicule();
    }
  }

  loadReferences(): void {
    this.vehiculeService
      .getCarburants()
      .subscribe((data) => (this.carburants = data));
    this.vehiculeService
      .getBoiteVitesses()
      .subscribe((data) => (this.boites = data));
  }

  nextStep(): void {
    if (this.canGoNext()) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  canGoNext(): boolean {
    if (this.currentStep === 1) {
      return (
        this.vehiculeForm.get('marque')!.valid &&
        this.vehiculeForm.get('modele')!.valid &&
        this.vehiculeForm.get('anneeFabrication')!.valid &&
        this.vehiculeForm.get('numeroVin')!.valid &&
        this.vehiculeForm.get('couleur')!.valid
      );
    }
    if (this.currentStep === 2) {
      // Check if reference data is loaded before allowing to proceed
      const hasCarburants = this.carburants.length > 0;
      const hasBoites = this.boites.length > 0;
      if (!hasCarburants || !hasBoites) {
        console.warn(
          'Reference data not loaded yet. Carburants:',
          this.carburants.length,
          'Boites:',
          this.boites.length,
        );
        // Show error message to user
        this.errorMessage =
          'Les données de référence sont en cours de chargement. Veuillez patienter un instant.';
        return false;
      }
      return (
        this.vehiculeForm.get('kilometrage')!.valid &&
        this.vehiculeForm.get('carburantId')!.valid &&
        this.vehiculeForm.get('boiteVitesseId')!.valid
      );
    }
    return true;
  }

  onPhotosChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.submitting = true;
      this.vehiculeService.uploadPhotos(Array.from(files)).subscribe({
        next: (urls: string[]) => {
          const currentPhotos =
            this.vehiculeForm.get('photosUrls')?.value || [];
          this.vehiculeForm
            .get('photosUrls')
            ?.setValue([...currentPhotos, ...urls]);
          this.updatePhotoPreviews();
          this.submitting = false;
          // Reset file input
          event.target.value = '';
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.errorMessage = "Erreur lors de l'upload des photos";
          this.submitting = false;
        },
      });
    }
  }

  updatePhotoPreviews(): void {
    const urls = this.vehiculeForm.get('photosUrls')?.value || [];
    this.photoPreviews = urls.map((url: string) => this.getImageUrl(url));
  }

  removePhoto(index: number): void {
    const currentPhotos = this.vehiculeForm.get('photosUrls')?.value || [];
    currentPhotos.splice(index, 1);
    this.vehiculeForm.get('photosUrls')?.setValue(currentPhotos);
    this.updatePhotoPreviews();
  }

  loadVehicule(): void {
    if (!this.vehiculeId) return;
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(this.vehiculeId).subscribe({
      next: (vehicule) => {
        this.vehiculeForm.patchValue({
          marque: vehicule.marque || '',
          modele: vehicule.modele || '',
          anneeFabrication:
            vehicule.anneeFabrication || new Date().getFullYear(),
          kilometrage: vehicule.kilometrage || 0,
          carburantId: vehicule.carburantId || '',
          boiteVitesseId: vehicule.boiteVitesseId || '',
          couleur: vehicule.couleur || '',
          prixVente: vehicule.prixVente || '',
          description: vehicule.description || '',
          numeroVin: vehicule.numeroVin || '',
          immatriculation: vehicule.immatriculation || '',
          titre: vehicule.titre || '',
          nombrePortes: vehicule.nombrePortes || 5,
          nombrePlaces: vehicule.nombrePlaces || 5,
          cylindree: vehicule.cylindree || '',
          puissanceFiscale: vehicule.puissanceFiscale || '',
          estGarantie: vehicule.estGarantie || false,
          garantieMois: vehicule.garantieMois || 0,
          prixNegociable: vehicule.prixNegociable || false,
          certifie: vehicule.certifie || false,
          enregistrerEnBrouillon: vehicule.statut === 'BROUILLON',
          photosUrls: vehicule.photosUrls || [],
        });
        this.updatePhotoPreviews();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicle', error);
        this.errorMessage = 'Impossible de charger les données du véhicule.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.invalid) {
      this.vehiculeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formValue = this.vehiculeForm.value;

    // Create a clean data object with correct types
    const data: any = {
      ...formValue,
      anneeFabrication: Number(formValue.anneeFabrication),
      kilometrage: Number(formValue.kilometrage),
      prixVente: Number(formValue.prixVente),
      nombrePortes: formValue.nombrePortes
        ? Number(formValue.nombrePortes)
        : undefined,
      nombrePlaces: formValue.nombrePlaces
        ? Number(formValue.nombrePlaces)
        : undefined,
      garantieMois: formValue.garantieMois ? Number(formValue.garantieMois) : 0,
    };

    // Remove empty strings for optional fields that shouldn't be sent as ''
    const optionalFields = [
      'immatriculation',
      'description',
      'titre',
      'cylindree',
      'puissanceFiscale',
    ];
    optionalFields.forEach((field) => {
      if (data[field] === '') {
        delete data[field];
      }
    });

    // Additional validation: ensure required UUID fields are valid UUIDs (not empty strings)
    const requiredUuidFields = ['carburantId', 'boiteVitesseId'];
    for (const field of requiredUuidFields) {
      if (!data[field] || data[field] === '') {
        console.error(`Missing required field: ${field}`);
        this.errorMessage = `Le champ ${field} est requis. Veuillez sélectionner une valeur.`;
        this.submitting = false;
        return;
      }
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data[field])) {
        console.error(`Invalid UUID format for ${field}: ${data[field]}`);
        this.errorMessage = `Le champ ${field} doit être un UUID valide.`;
        this.submitting = false;
        return;
      }
    }

    console.log('Sending vehicle data:', data);

    const obs =
      this.isEditMode && this.vehiculeId
        ? this.vehiculeService.updateVehicule(this.vehiculeId, data)
        : this.vehiculeService.createVehicule(data);

    obs.subscribe({
      next: (response) => {
        this.submitting = false;
        this.successMessage = this.isEditMode
          ? 'Annonce mise à jour !'
          : 'Annonce publiée avec succès !';
        setTimeout(() => {
          this.router.navigate(['/vehicles', response.id]);
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving vehicle', error);
        // Log detailed error information
        if (error.error) {
          console.error('Error details:', JSON.stringify(error.error, null, 2));
        }
        if (error.status === 400 && error.error?.message) {
          // Handle array of validation messages or single message
          const message = error.error.message;
          if (Array.isArray(message)) {
            this.errorMessage = `Erreurs de validation: ${message.join(', ')}`;
          } else {
            this.errorMessage = message;
          }
        } else if (error.status === 400 && error.error?.errors) {
          // Format validation errors
          const validationErrors = error.error.errors;
          const errorMessages = Object.entries(validationErrors)
            .map(
              ([field, details]: [string, any]) =>
                `${field}: ${details.message || details}`,
            )
            .join(', ');
          this.errorMessage = `Erreurs de validation: ${errorMessages}`;
        } else {
          this.errorMessage =
            "Une erreur est survenue lors de l'enregistrement. Veuillez vérifier tous les champs.";
        }
        this.submitting = false;
      },
    });
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
