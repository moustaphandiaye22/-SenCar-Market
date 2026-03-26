import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  MapPin,
  Phone,
  Building,
  Info,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  Mail,
  Globe,
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from 'lucide-angular';
import { GarageService } from '../services/garage.service';
import { environment } from '../../../../environments/environment';
import { ServiceGarage } from '../models/garage.model';
import { SafePipe } from '../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-garage-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    SafePipe,
  ],
  templateUrl: './garage-form.component.html',
})
export class GarageFormComponent implements OnInit {
  garageForm: FormGroup;
  isEdit = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  garageId?: string;
  availableServices: ServiceGarage[] = [];

  currentStep = 1;
  logoPreview: string | null = null;
  selectedLogoFile: File | null = null;

  readonly icons = {
    MapPin,
    Phone,
    Building,
    Info,
    Save,
    X,
    Plus,
    Trash2,
    Clock,
    Mail,
    Globe,
    Upload,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
  };

  constructor(
    private fb: FormBuilder,
    private garageService: GarageService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    this.garageForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      horairesOuverture: [''],
      ville: ['', [Validators.required]],
      pays: ['Sénégal'],
      logoUrl: [''],
      latitude: [14.7167],
      longitude: [-17.4677],
      services: this.fb.array([]),
    });
  }

  get services(): FormArray {
    return this.garageForm.get('services') as FormArray;
  }

  ngOnInit(): void {
    this.loadAvailableServices();
    this.garageId = this.route.snapshot.params['id'];
    if (this.garageId && this.garageId !== 'new') {
      this.isEdit = true;
      this.loadGarage(this.garageId);
    }
  }

  loadAvailableServices(): void {
    this.garageService.getAllServices().subscribe({
      next: (services) => {
        this.availableServices = services;
      },
      error: (err) => console.error('Error loading services', err),
    });
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
        this.garageForm.get('nom')!.valid &&
        this.garageForm.get('description')!.valid
      );
    }
    if (this.currentStep === 2) {
      return (
        this.garageForm.get('telephone')!.valid &&
        this.garageForm.get('ville')!.valid &&
        this.garageForm.get('adresse')!.valid
      );
    }
    return true;
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Get current location using browser Geolocation API
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage =
        "La géolocalisation n'est pas supportée par votre navigateur";
      return;
    }

    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.garageForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.isLoading = false;
        this.successMessage = 'Position actuelle détectée !';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      (error) => {
        this.isLoading = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            this.errorMessage = 'Position non disponible';
            break;
          case error.TIMEOUT:
            this.errorMessage = 'Délai de localisation dépassé';
            break;
          default:
            this.errorMessage = 'Erreur de géolocalisation';
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  addService(): void {
    const serviceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      prix: [null, [Validators.min(0)]],
    });
    this.services.push(serviceGroup);
  }

  removeService(index: number): void {
    this.services.removeAt(index);
  }

  loadGarage(id: string): void {
    this.isLoading = true;
    this.garageService.getGarageById(id).subscribe({
      next: (garage) => {
        this.garageForm.patchValue(garage);
        if (garage.logoUrl) {
          this.logoPreview = garage.logoUrl.startsWith('http')
            ? garage.logoUrl
            : `${environment.apiUrl.replace('/api', '')}${garage.logoUrl}`;
        }

        // Load services
        this.garageService.getServicesByGarage(id).subscribe({
          next: (associations) => {
            this.services.clear();
            if (associations && associations.length > 0) {
              associations.forEach((assoc) => {
                this.services.push(
                  this.fb.group({
                    serviceId: [assoc.serviceId, Validators.required],
                    prix: [assoc.prix, [Validators.min(0)]],
                  }),
                );
              });
            } else {
              this.addService(); // Add one empty service line if none
            }
          },
          error: (err) => console.error('Error loading garage services', err),
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading garage', err);
        this.isLoading = false;
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.garageForm.invalid) {
      this.garageForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 1. Upload logo if selected
      if (this.selectedLogoFile) {
        const uploadRes = await this.garageService
          .uploadLogo(this.selectedLogoFile)
          .toPromise();
        if (uploadRes) {
          this.garageForm.patchValue({ logoUrl: uploadRes.url });
        }
      }

      const request = this.garageForm.value;

      // Filter out services without an ID
      if (request.services) {
        request.services = request.services.filter((s: any) => s.serviceId);
      }

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
            this.errorMessage =
              'Une erreur est survenue lors de la mise à jour.';
            this.isLoading = false;
          },
        });
      } else {
        this.garageService.createGarage(request).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.successMessage =
              'Votre garage a été créé avec succès ! Il est actuellement en attente de validation par notre équipe.';
            setTimeout(() => {
              this.router.navigate(['/garages', res.id]);
            }, 4000);
          },
          error: (err) => {
            console.error('Error creating garage', err);
            this.errorMessage =
              err.error?.message ||
              'Une erreur est survenue lors de la création du garage.';
            this.isLoading = false;
          },
        });
      }
    } catch (err) {
      console.error('Error during submission', err);
      this.errorMessage =
        "Une erreur est survenue lors du chargement de l'image.";
      this.isLoading = false;
    }
  }

  // Generate map preview URL for form
  getMapPreviewUrl(): SafeResourceUrl | null {
    const lat = this.garageForm.get('latitude')?.value;
    const lng = this.garageForm.get('longitude')?.value;
    if (!lat || !lng) return null;
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
