import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { VehiculeResponse } from '../../../core/models/vehicule.model';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Heart, Share2, MapPin, Gauge, Fuel, Calendar, ShieldCheck, Phone, Mail, ArrowLeft, Zap, CheckCircle2, Trash2, Shield } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { AvisListComponent } from '../../avis/components/avis-list/avis-list.component';
import { AvisFormComponent } from '../../avis/components/avis-form/avis-form.component';
import { CertificationService } from '../../../core/services/certification.service';
import { AvisService } from '../../../core/services/avis.service';
import { ToastService } from '../../../core/services/toast.service';
import { MessagerieService } from '../../messagerie/services/messagerie.service';

@Component({
  selector: 'app-vehicule-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, AvisListComponent, AvisFormComponent],
  templateUrl: './vehicule-detail.component.html'
})
export class VehiculeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehiculeService = inject(VehiculeService);
  private authService = inject(AuthService);
  private certificationService = inject(CertificationService);
  private avisService = inject(AvisService);
  private toast = inject(ToastService);
  private messagerieService = inject(MessagerieService);

  vehicule: VehiculeResponse | null = null;
  isLoading = true;
  errorMessage = '';
  activePhotoIndex = 0;
  isCertifying = false;
  showAvisForm = false;
  transactionId = '';
  showPhone = false;
  
  currentUser$ = this.authService.currentUser$;

  icons = { Heart, Share2, MapPin, Phone, Mail, CheckCircle2, Shield, Calendar, ShieldCheck, Zap, Trash2, ArrowLeft };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicule(id);
    }
  }

  loadVehicule(id: string): void {
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(id).subscribe({
      next: (res) => {
        this.vehicule = res;
        this.isLoading = false;
        this.checkAvisEligibility();
      },
      error: (err) => {
        console.error('Error loading vehicle', err);
        this.errorMessage = 'Véhicule introuvable.';
        this.isLoading = false;
      }
    });
  }

  checkAvisEligibility(): void {
    const user = this.authService.getUser();
    if (user && this.vehicule) {
      // In a real scenario, we'd fetch the user's transactions for this vehicle first.
      // For now, we'll check if they have any confirmed payment for this vehicle.
      this.avisService.getAvisByVehicule(this.vehicule.id).subscribe(res => {
        const hasAlreadyCommented = res.content.some(a => a.auteurId === user.id);
        if (!hasAlreadyCommented) {
          // If they haven't commented, we'll try to find a transaction
          // For now, let's assume we can try to leave an avis if they are not the owner
          if (this.vehicule?.proprietaireId !== user.id) {
            this.showAvisForm = true;
            // We need a transaction ID. In a perfect world, we'd get it from the payment history.
            // Placeholder for now or fallback to a dummy if testing.
            this.transactionId = '00000000-0000-0000-0000-000000000000'; 
          }
        }
      });
    }
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
        this.toast.success('Votre annonce a été publiée avec succès !');
      },
      error: () => this.toast.error('Erreur lors de la publication.')
    });
  }

  deleteVehicule(): void {
    if (!this.vehicule) return;
    this.vehiculeService.deleteVehicule(this.vehicule.id).subscribe({
      next: () => {
        this.toast.success('Annonce supprimée.');
        this.router.navigate(['/vehicles/me']);
      },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  boostVehicule(): void {
    if (!this.vehicule) return;
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
        this.toast.success('Votre annonce est maintenant boostée pour 7 jours !');
      },
      error: () => this.toast.error('Erreur lors du boost.')
    });
  }

  demanderCertification(): void {
    if (!this.vehicule) return;
    this.isCertifying = true;
    this.certificationService.createDemande({ vehiculeId: this.vehicule.id }).subscribe({
      next: () => {
        this.isCertifying = false;
        this.toast.success('Demande de certification créée ! Procédez au paiement.');
        this.router.navigate(['/dashboard'], { queryParams: { tab: 'certification' } });
      },
      error: (err) => {
        this.isCertifying = false;
        this.toast.error('Erreur : ' + (err.error?.message || 'Problème technique'));
      }
    });
  }

  onShowPhone(): void {
    this.showPhone = true;
  }

  onContactEmail(): void {
    if (this.vehicule?.proprietaireEmail) {
      const subject = `Intérêt pour votre annonce : ${this.vehicule.marque} ${this.vehicule.modele}`;
      window.location.href = `mailto:${this.vehicule.proprietaireEmail}?subject=${encodeURIComponent(subject)}`;
    }
  }

  onMessageDirect(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.toast.info('Veuillez vous connecter pour envoyer un message.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (user.id === this.vehicule?.proprietaireId) {
      this.toast.warning('Vous ne pouvez pas vous envoyer de message à vous-même.');
      return;
    }

    if (this.vehicule?.proprietaireId) {
      const titre = `Négociation : ${this.vehicule.marque} ${this.vehicule.modele}`;
      this.messagerieService.createConversation(this.vehicule.proprietaireId, titre).subscribe({
        next: (conv) => {
          this.router.navigate(['/messagerie'], { queryParams: { id: conv.id } });
        },
        error: () => this.toast.error('Impossible de créer la conversation.')
      });
    }
  }
}
