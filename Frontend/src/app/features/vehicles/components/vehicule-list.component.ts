import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { VehiculeResponse, VehiculeFilter } from '../../../core/models/vehicule.model';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Search, Filter, SlidersHorizontal, Heart, MapPin, Gauge, Fuel, Zap } from 'lucide-angular';

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './vehicule-list.component.html'
})
export class VehiculeListComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);

  vehicules: VehiculeResponse[] = [];
  isLoading = true;
  totalElements = 0;
  
  filters: VehiculeFilter = {
    page: 0,
    size: 12,
    sortBy: 'createdAt',
    sortDir: 'DESC'
  };

  icons = { Search, Filter, SlidersHorizontal, Heart, MapPin, Gauge, Fuel, Zap };

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules(): void {
    this.isLoading = true;
    this.vehiculeService.searchVehicules(this.filters).subscribe({
      next: (response) => {
        this.vehicules = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicles', error);
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 0;
    this.loadVehicules();
  }

  toggleFavorite(event: Event, vehicule: VehiculeResponse): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (vehicule.estFavori) {
      this.vehiculeService.removeFromFavoris(vehicule.id).subscribe(() => {
        vehicule.estFavori = false;
        if (vehicule.nombreFavoris !== null) vehicule.nombreFavoris--;
      });
    } else {
      this.vehiculeService.addToFavoris(vehicule.id).subscribe(() => {
        vehicule.estFavori = true;
        if (vehicule.nombreFavoris !== null) vehicule.nombreFavoris++;
      });
    }
  }

  getYear(date: Date | null | string): number {
    if (!date) return new Date().getFullYear();
    return new Date(date).getFullYear();
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  formatPrice(price: string | null | undefined): string {
    if (!price) return '0 FCFA';
    const num = parseFloat(price);
    if (isNaN(num)) return price + ' FCFA';
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  }
}
