import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, MapPin, Phone, Star, Filter, ArrowRight, Wrench } from 'lucide-angular';
import { GarageService } from '../services/garage.service';
import { Garage } from '../models/garage.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-garage-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './garage-list.component.html',
  styleUrls: ['./garage-list.component.css']
})
export class GarageListComponent implements OnInit {
  garages: Garage[] = [];
  isLoading = true;
  totalElements = 0;
  
  filters = {
    q: '',
    ville: '',
    page: 0,
    size: 12
  };

  readonly icons = {
    Search,
    MapPin,
    Phone,
    Star,
    Filter,
    ArrowRight,
    Wrench
  };

  constructor(
    private garageService: GarageService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGarages();
  }

  loadGarages(): void {
    this.isLoading = true;
    this.garageService.getActiveGarages(this.filters.page, this.filters.size).subscribe({
      next: (response) => {
        this.garages = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading garages', error);
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 0;
    if (this.filters.q.length > 2 || this.filters.q.length === 0) {
      this.search();
    }
  }

  search(): void {
    if (this.filters.q) {
      this.isLoading = true;
      this.garageService.searchGarages(this.filters.q).subscribe({
        next: (response) => {
          this.garages = response;
          this.totalElements = response.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching garages', error);
          this.isLoading = false;
        }
      });
    } else {
      this.loadGarages();
    }
  }

  getLogoUrl(url?: string | null): string {
    if (!url) return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.filters.q || 'Garage')}&backgroundColor=F3F4F6&textColor=1F2937`;
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
