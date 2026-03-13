import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { VehiculeResponse } from '../../../core/models/vehicule.model';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Heart, Share2, MapPin, Gauge, Fuel, Calendar, ShieldCheck, Phone, Mail, ArrowLeft, Zap, CheckCircle2, Trash2 } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-vehicule-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './vehicule-detail.component.html'
})
export class VehiculeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehiculeService = inject(VehiculeService);
  private authService = inject(AuthService);

  vehicule: VehiculeResponse | null = null;
  isLoading = true;
  errorMessage = '';
  activePhotoIndex = 0;
  
  currentUser$ = this.authService.currentUser$;

  icons = { Heart, Share2, MapPin, Gauge, Fuel, Calendar, ShieldCheck, Phone, Mail, ArrowLeft, Zap, CheckCircle2, Trash2 };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicule(id);
    }
  }

  loadVehicule(id: string): void {
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(id).subscribe({
      next: (vehicule) => {
        this.vehicule = vehicule;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicle', error);
        this.errorMessage = 'Véhicule non trouvé.';
        this.isLoading = false;
      }
    });
  }

  toggleFavorite(): void {
    if (!this.vehicule) return;
    
    if (this.vehicule.estFavori) {
      this.vehiculeService.removeFromFavoris(this.vehicule.id).subscribe(() => {
        if (this.vehicule) {
          this.vehicule.estFavori = false;
          if (this.vehicule.nombreFavoris !== null) this.vehicule.nombreFavoris--;
        }
      });
    } else {
      this.vehiculeService.addToFavoris(this.vehicule.id).subscribe(() => {
        if (this.vehicule) {
          this.vehicule.estFavori = true;
          if (this.vehicule.nombreFavoris !== null) this.vehicule.nombreFavoris++;
        }
      });
    }
  }

  setActivePhoto(index: number): void {
    this.activePhotoIndex = index;
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  formatPrice(price: string | null): string {
    if (!price) return '0 FCFA';
    const num = parseFloat(price);
    if (isNaN(num)) return price + ' FCFA';
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  }

  publishVehicule(): void {
    if (!this.vehicule) return;
    this.vehiculeService.publishVehicule(this.vehicule.id).subscribe({
      next: (updated) => {
        this.vehicule = updated;
        alert('Votre annonce a été publiée avec succès !');
      },
      error: (err) => alert('Erreur lors de la publication.')
    });
  }

  deleteVehicule(): void {
    if (!this.vehicule) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      this.vehiculeService.deleteVehicule(this.vehicule.id).subscribe({
        next: () => {
          alert('Annonce supprimée.');
          this.router.navigate(['/vehicles/me']);
        },
        error: (err) => alert('Erreur lors de la suppression.')
      });
    }
  }

  boostVehicule(): void {
    if (!this.vehicule) return;
    // Simple boost for 7 days starting now
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    this.vehiculeService.boostVehicule(
      this.vehicule.id, 
      now.toISOString(), 
      nextWeek.toISOString()
    ).subscribe({
      next: (updated) => {
        this.vehicule = updated;
        alert('Votre annonce est maintenant boostée pour 7 jours !');
      },
      error: (err) => alert('Erreur lors du boost.')
    });
  }
}
