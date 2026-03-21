import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LucideAngularModule, Calendar, MapPin, Shield, CheckCircle, Info, ChevronLeft, Star, Fuel, Gauge, Clock, Armchair, Edit, Trash2, Power, PowerOff, MessageCircle } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { RentalService } from '../services/rental.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnnonceLocation } from '../models/rental.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { PaiementService } from '../../paiement/services/paiement.service';
import { MessagerieService } from '../../messagerie/services/messagerie.service';

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
  reservationId = '';
  isPaying = false;
  paymentSuccess = false;
  selectedPaymentMethod = '';
  totalPrice = 0;
  showPhone = false;

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
    PowerOff,
    MessageCircle
  };

  constructor(
    private route: ActivatedRoute,
    private rentalService: RentalService,
    private router: Router,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private paiementService: PaiementService,
    private messagerieService: MessagerieService
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
      next: (res) => {
        this.isReserving = false;
        this.reservationId = res.id;
        this.totalPrice = res.coutTotal ? parseFloat(res.coutTotal) : 0;
        this.reservationSuccess = true;
        this.toastService.success('Réservation enregistrée ! Veuillez procéder au paiement.');
      },
      error: (err) => {
        console.error('Reservation error', err);
        this.isReserving = false;
        const msg = err.error?.message || 'Erreur lors de la réservation. Veuillez vérifier les disponibilités.';
        this.toastService.error(msg);
      }
    });
  }

  formatPrice(price?: string | number | null): string {
    if (price === undefined || price === null) return '0 FCFA';
    const amount = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  deleteAnnonce(): void {
    this.confirmService.show({
      title: 'Supprimer l\'annonce ?',
      message: 'Êtes-vous sûr de vouloir supprimer cette annonce de location ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Retour',
      onConfirm: () => {
        if (!this.annonce?.id) return;
        this.rentalService.deleteAnnonce(this.annonce.id).subscribe({
          next: () => this.router.navigate(['/locations']),
          error: (err) => console.error('Error deleting rental', err)
        });
      }
    });
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

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  onPay(): void {
    if (!this.reservationId || !this.selectedPaymentMethod) return;

    this.isPaying = true;
    const paymentData = {
      reservationId: this.reservationId,
      montant: this.totalPrice,
      methodePaiement: this.selectedPaymentMethod,
      telephone: '770000000' // Mock phone for OM/Wave
    };

    let paymentObs: Observable<any>;
    if (this.selectedPaymentMethod === 'WAVE') {
      paymentObs = this.paiementService.createPaiementWave(paymentData);
    } else if (this.selectedPaymentMethod === 'ORANGE_MONEY') {
      paymentObs = this.paiementService.createPaiementOrangeMoney(paymentData);
    } else {
      paymentObs = this.paiementService.createPaiement(paymentData);
    }

    paymentObs.subscribe({
      next: (res: any) => {
        this.isPaying = false;
        if (res.urlPaiement) {
          this.toastService.info('Redirection vers le portail de paiement...');
          setTimeout(() => window.location.href = res.urlPaiement, 1000);
        } else {
          this.paymentSuccess = true;
          this.toastService.success('Paiement réussi ! Votre réservation est confirmée.');
          setTimeout(() => this.router.navigate(['/locations']), 3000);
        }
      },
      error: (err: any) => {
        console.error('Payment error', err);
        this.isPaying = false;
        this.toastService.error('Erreur lors du paiement. Veuillez réessayer.');
      }
    });
  }

  onShowPhone(): void {
    this.showPhone = true;
  }

  onContactEmail(): void {
    if (this.annonce?.proprietaireEmail) {
      const subject = `Intérêt pour votre annonce : ${this.annonce.vehiculeMarque} ${this.annonce.vehiculeModele}`;
      window.location.href = `mailto:${this.annonce.proprietaireEmail}?subject=${encodeURIComponent(subject)}`;
    }
  }

  onMessageDirect(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.toastService.info('Veuillez vous connecter pour envoyer un message.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (user.id === this.annonce?.proprietaireId) {
      this.toastService.warning('Vous ne pouvez pas vous envoyer de message à vous-même.');
      return;
    }

    if (this.annonce?.proprietaireId) {
      const titre = `Négociation Location : ${this.annonce.vehiculeMarque} ${this.annonce.vehiculeModele}`;
      this.messagerieService.createConversation(this.annonce.proprietaireId, titre, this.annonce.id).subscribe({
        next: (conv) => {
          this.router.navigate(['/messagerie'], { queryParams: { id: conv.id } });
        },
        error: () => this.toastService.error('Impossible de créer la conversation.')
      });
    }
  }

  onWhatsAppContact(): void {
    const phone = this.annonce?.proprietaireTelephone;
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 9 ? '221' + cleanPhone : cleanPhone;
      const message = encodeURIComponent(`Bonjour, je vous contacte via Sen-Car Market pour votre annonce de location : ${this.annonce?.vehiculeMarque} ${this.annonce?.vehiculeModele}.`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  }
}
