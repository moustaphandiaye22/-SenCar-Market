import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Phone, Globe, Mail, Clock, ShieldCheck, Star, Calendar, MessageCircle, Wrench, ArrowLeft, Edit, Trash2 } from 'lucide-angular';
import { GarageService } from '../services/garage.service';
import { Garage, GarageServiceAssociation } from '../models/garage.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-garage-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './garage-detail.component.html'
})
export class GarageDetailComponent implements OnInit {
  garage?: Garage;
  services: GarageServiceAssociation[] = [];
  isLoading = true;
  isOwner = false;

  readonly icons = {
    MapPin,
    Phone,
    Globe,
    Mail,
    Clock,
    ShieldCheck,
    Star,
    Calendar,
    MessageCircle,
    Wrench,
    ArrowLeft,
    Edit,
    Trash2
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private garageService: GarageService,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGarageData(id);
    }
  }

  loadGarageData(id: string): void {
    this.isLoading = true;
    this.garageService.getGarageById(id).subscribe({
      next: (garage) => {
        this.garage = garage;
        const currentUser = this.authService.currentUserValue;
        this.isOwner = !!currentUser && !!garage.proprietaireId && currentUser.id === garage.proprietaireId;
        
        this.loadServices(id);
      },
      error: (error) => {
        console.error('Error loading garage', error);
        this.isLoading = false;
      }
    });
  }

  loadServices(garageId: string): void {
    this.garageService.getServicesByGarage(garageId).subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services', error);
        this.isLoading = false;
      }
    });
  }

  getLogoUrl(url?: string | null): string {
    if (!url) return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.garage?.nom || 'Garage')}&backgroundColor=F3F4F6&textColor=1F2937`;
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  formatPrice(price: number | string | null | undefined): string {
    if (price === null || price === undefined) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Number(price));
  }

  deleteGarage(): void {
    this.confirmService.show({
      title: 'Supprimer le garage ?',
      message: 'Êtes-vous sûr de vouloir supprimer ce garage ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Retour',
      onConfirm: () => {
        if (!this.garage?.id) return;
        this.garageService.deleteGarage(this.garage.id).subscribe({
          next: () => this.router.navigate(['/garages']),
          error: (err) => console.error('Error deleting garage', err)
        });
      }
    });
  }

  onWhatsAppContact(): void {
    const phone = this.garage?.telephone;
    if (phone) {
      // Nettoyage du numéro : garder uniquement les chiffres
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      // Ajout de l'indicatif Sénégal si absent (si numéro à 9 chiffres)
      const formattedPhone = cleanPhone.length === 9 ? '221' + cleanPhone : cleanPhone;
      
      const message = encodeURIComponent(`Bonjour, je vous contacte via Sen-Car Market pour une demande de service dans votre garage ${this.garage?.nom}.`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  }

  onReserveService(service?: GarageServiceAssociation): void {
    if (!this.authService.currentUserValue) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    const serviceName = service ? service.serviceNom : 'un service';
    this.confirmService.show({
      title: 'Réserver un service',
      message: `Souhaitez-vous prendre rendez-vous pour ${serviceName} ? Le garage vous recontactera pour confirmer le créneau.`,
      confirmText: 'Confirmer la demande',
      cancelText: 'Annuler',
      onConfirm: () => {
        const request = {
          garageId: this.garage?.id,
          serviceId: service?.serviceId,
          dateRendezVous: new Date().toISOString(),
          commentaire: `Demande de rendez-vous pour ${serviceName}`
        };

        this.garageService.createRendezVous(request).subscribe({
          next: () => {
             this.toastService.success('Votre demande de rendez-vous a été envoyée ! Vous recevrez une notification prochainement.');
          },
          error: (err) => {
            console.error('Error creating rendez-vous', err);
            this.toastService.error('Erreur lors de l\'envoi de la demande.');
          }
        });
      }
    });
  }
}
