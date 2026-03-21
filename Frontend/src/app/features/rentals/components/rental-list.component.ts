import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  MapPin,
  Calendar,
  Fuel,
  Gauge,
  Filter,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import { RentalService } from '../services/rental.service';
import { AnnonceLocation } from '../models/rental.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './rental-list.component.html',
})
export class RentalListComponent implements OnInit {
  annonces: AnnonceLocation[] = [];
  filteredAnnonces: AnnonceLocation[] = [];
  isLoading = true;
  activeFilter = 'Tout';
  totalElements = 0;
  totalPages = 0;

  filters = {
    q: '',
    dateDebut: '',
    dateFin: '',
    page: 0,
    size: 9,
  };

  readonly icons = {
    Search,
    MapPin,
    Calendar,
    Fuel,
    Gauge,
    Filter,
    Star,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
  };

  constructor(
    private rentalService: RentalService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadAnnonces();
  }

  loadAnnonces(): void {
    this.isLoading = true;
    this.rentalService
      .getAllAnnonces(this.filters.page, this.filters.size)
      .subscribe({
        next: (res) => {
          // Handle both paginated response and array response
          if (Array.isArray(res)) {
            this.annonces = res;
            this.totalElements = res.length;
            this.totalPages = Math.ceil(this.totalElements / this.filters.size);
          } else if (Array.isArray(res?.content)) {
            this.annonces = res.content;
            this.totalElements = res.totalElements ?? res.content.length;
            this.totalPages =
              res.totalPages ??
              Math.ceil(this.totalElements / this.filters.size);
          } else {
            // Fallback to empty array if response is unexpected
            console.warn('Unexpected API response format:', res);
            this.annonces = [];
            this.totalElements = 0;
            this.totalPages = 0;
          }
          this.isLoading = false;
          this.applyFilter();
        },
        error: (err) => {
          console.error('Error loading rentals', err);
          this.isLoading = false;
          this.annonces = [];
          this.filteredAnnonces = [];
        },
      });
  }

  filterByCategory(category: string): void {
    this.activeFilter = category;
    this.filters.page = 0;
    this.applyFilter();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.filters.page = page;
      this.loadAnnonces();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.goToPage(this.filters.page + 1);
  }

  previousPage(): void {
    this.goToPage(this.filters.page - 1);
  }

  get startItem(): number {
    return this.filters.page * this.filters.size + 1;
  }

  get endItem(): number {
    return Math.min(
      (this.filters.page + 1) * this.filters.size,
      this.totalElements,
    );
  }

  applyFilter(): void {
    // Safety check: ensure annonces is an array
    if (!Array.isArray(this.annonces)) {
      this.filteredAnnonces = [];
      return;
    }
    let results = [...this.annonces];

    // Filter by Search Term (Location/Keyword)
    if (this.filters.q) {
      const q = this.filters.q.toLowerCase();
      results = results.filter(
        (a) =>
          a.vehiculeMarque?.toLowerCase().includes(q) ||
          a.vehiculeModele?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.conditions?.toLowerCase().includes(q),
      );
    }

    // Filter by Category (Active Tab)
    if (this.activeFilter !== 'Tout') {
      results = results.filter((a) => {
        const searchStr =
          `${a.vehiculeMarque ?? ''} ${a.vehiculeModele ?? ''} ${a.description ?? ''} ${a.vehiculeTransmission ?? ''} ${a.vehiculeCarburant ?? ''}`.toLowerCase();
        switch (this.activeFilter) {
          case 'SUV & 4x4':
            return (
              searchStr.includes('suv') ||
              searchStr.includes('4x4') ||
              searchStr.includes('prado') ||
              searchStr.includes('cherokee') ||
              searchStr.includes('jeep')
            );
          case 'Berlines':
            return (
              searchStr.includes('berline') ||
              searchStr.includes('sedan') ||
              searchStr.includes('corolla') ||
              searchStr.includes('mercedes') ||
              searchStr.includes('bmw')
            );
          case 'Économiques':
            return (
              searchStr.includes('eco') ||
              searchStr.includes('petit') ||
              searchStr.includes('yaris') ||
              searchStr.includes('kia') ||
              searchStr.includes('i10')
            );
          default:
            return true;
        }
      });
    }

    this.filteredAnnonces = results;
  }

  formatPrice(price: string | null): string {
    if (!price) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(parseInt(price));
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url)
      return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
