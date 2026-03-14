import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Shield, CheckCircle, Info, ChevronLeft, Star, Fuel, Gauge, Clock, Armchair, Edit, Trash2, Power, PowerOff } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { RentalService } from '../services/rental.service';
import { AnnonceLocation } from '../models/rental.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './rental-detail.component.html'
})
export class RentalDetailComponent implements OnInit {
  annonce?: AnnonceLocation;
  isLoading = true;
  isReserving = false;
  reservationSuccess = false;
  
  // Reservation form data
  dateDebut = '';
  dateFin = '';
  isOwner = false;

  readonly icons = {
    Calendar,
    MapPin,
    Shield,
    CheckCircle,
    Info,
    ChevronLeft,
    Star,
    Fuel,
    Gauge,
    Clock,
    Armchair,
    Edit,
    Trash2,
    Power,
    PowerOff
  };

  constructor(
    private route: ActivatedRoute,
    private rentalService: RentalService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadAnnonce(id);
  }

  loadAnnonce(id: string): void {
    this.isLoading = true;
    this.rentalService.getAnnonceById(id).subscribe({
      next: (res) => {
        this.annonce = res;
        const currentUser = this.authService.currentUserValue;
        this.isOwner = !!currentUser && !!res.proprietaireId && currentUser.id === res.proprietaireId;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading rental detail', err);
        this.isLoading = false;
      }
    });
  }

  onReserve(): void {
    if (!this.dateDebut || !this.dateFin || !this.annonce) return;

    this.isReserving = true;
    const request = {
      annonceLocationId: this.annonce.id,
      dateDebut: new Date(this.dateDebut).toISOString(),
      dateFin: new Date(this.dateFin).toISOString()
    };

    this.rentalService.createReservation(request).subscribe({
      next: () => {
        this.isReserving = false;
        this.reservationSuccess = true;
        setTimeout(() => this.router.navigate(['/locations']), 3000);
      },
      error: (err) => {
        console.error('Reservation error', err);
        this.isReserving = false;
      }
    });
  }

  formatPrice(price?: string | number | null): string {
    if (price === undefined || price === null) return '0 FCFA';
    const amount = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  }

  deleteAnnonce(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce de location ?')) {
      if (!this.annonce?.id) return;
      this.rentalService.deleteAnnonce(this.annonce.id).subscribe({
        next: () => this.router.navigate(['/locations']),
        error: (err) => console.error('Error deleting rental', err)
      });
    }
  }

  activerAnnonce(): void {
    if (!this.annonce?.id) return;
    this.rentalService.activerAnnonce(this.annonce.id).subscribe({
      next: (res) => this.annonce = res,
      error: (err) => console.error('Error activating rental', err)
    });
  }

  desactiverAnnonce(): void {
    if (!this.annonce?.id) return;
    this.rentalService.desactiverAnnonce(this.annonce.id).subscribe({
      next: (res) => this.annonce = res,
      error: (err) => console.error('Error deactivating rental', err)
    });
  }
}
