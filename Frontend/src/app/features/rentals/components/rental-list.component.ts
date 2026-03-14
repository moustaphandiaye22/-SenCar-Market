import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, MapPin, Calendar, Fuel, Gauge, Filter, Star, CheckCircle } from 'lucide-angular';
import { RentalService } from '../services/rental.service';
import { AnnonceLocation } from '../models/rental.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './rental-list.component.html'
})
export class RentalListComponent implements OnInit {
  annonces: AnnonceLocation[] = [];
  filteredAnnonces: AnnonceLocation[] = [];
  isLoading = true;
  activeFilter = 'Tout';
  
  filters = {
    q: '',
    dateDebut: '',
    dateFin: ''
  };

  readonly icons = {
    Search,
    MapPin,
    Calendar,
    Fuel,
    Gauge,
    Filter,
    Star,
    CheckCircle
  };

  constructor(
    private rentalService: RentalService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnnonces();
  }

  loadAnnonces(): void {
    this.isLoading = true;
    this.rentalService.getAllAnnonces().subscribe({
      next: (res) => {
        this.annonces = res;
        this.filteredAnnonces = res;
        this.isLoading = false;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading rentals', err);
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.activeFilter = category;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'Tout') {
      this.filteredAnnonces = [...this.annonces];
    } else {
      this.filteredAnnonces = this.annonces.filter(a => {
        const searchStr = `${a.vehiculeMarque ?? ''} ${a.vehiculeModele ?? ''} ${a.description ?? ''} ${a.conditions ?? ''}`.toLowerCase();
        switch (this.activeFilter) {
          case 'SUV & 4x4':
            return searchStr.includes('suv') || searchStr.includes('4x4') || searchStr.includes('prado');
          case 'Berlines':
            return searchStr.includes('berline') || searchStr.includes('sedan') || searchStr.includes('corolla');
          case 'Économiques':
            return searchStr.includes('eco') || searchStr.includes('petit') || searchStr.includes('yaris');
          default:
            return true;
        }
      });
    }
  }

  formatPrice(price: string | null): string {
    if (!price) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(parseInt(price));
  }
}
