import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Tag, MapPin, Gauge, ShieldCheck, Heart } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { VehiculeService } from '../../core/services/vehicule.service';
import { VehiculeResponse } from '../../core/models/vehicule.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);
  
  icons = { Search, Tag, MapPin, Gauge, ShieldCheck, Heart };
  
  latestVehicules: VehiculeResponse[] = [];
  isLoading = true;
  error = false;

  ngOnInit(): void {
    // Fetch some vehicles for the homepage
    this.vehiculeService.searchVehicules({ size: 6, sortDir: 'DESC' }).subscribe({
      next: (res) => {
        // Handle paginated response structure from backend
        this.latestVehicules = res?.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vehicles', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }
}
