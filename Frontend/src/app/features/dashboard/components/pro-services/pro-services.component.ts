import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GarageService } from '../../../garages/services/garage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, Wrench, Settings, Plus, Building, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-pro-services',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './pro-services.component.html'
})
export class ProServicesComponent implements OnInit {
  private garageService = inject(GarageService);
  private authService = inject(AuthService);
  
  garages: any[] = [];
  servicesDispos: any[] = [];
  
  selectedGarageId: string | null = null;
  garageServices: any[] = [];
  
  serviceToAdd: string = '';
  customPrix: number | null = null;
  
  isLoading = true;
  icons = { Wrench, Settings, Plus, Building, Trash2 };

  ngOnInit() {
    this.loadMyGarages();
    this.garageService.getAllServices().subscribe(res => this.servicesDispos = res);
  }

  loadMyGarages() {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.garageService.getGaragesByProprietaire(user.id).subscribe(res => {
        this.garages = res;
        this.isLoading = false;
        if(this.garages.length > 0 && !this.selectedGarageId) {
          this.selectGarage(this.garages[0].id);
        }
      });
    }
  }

  selectGarage(id: string) {
    this.selectedGarageId = id;
    this.loadGarageServices(id);
  }

  loadGarageServices(id: string) {
    this.garageService.getServicesByGarage(id).subscribe(res => {
      this.garageServices = res;
    });
  }

  addServiceToGarage() {
    if (this.selectedGarageId && this.serviceToAdd) {
      const payload = { 
        serviceId: this.serviceToAdd, 
        prix: this.customPrix || undefined 
      };
      
      this.garageService.associateService(this.selectedGarageId, payload).subscribe(() => {
        this.loadGarageServices(this.selectedGarageId!);
        this.serviceToAdd = '';
        this.customPrix = null;
      });
    }
  }

  removeService(serviceId: string) {
    if (this.selectedGarageId && confirm("Retirer ce service du catalogue du garage ?")) {
      this.garageService.disassociateService(this.selectedGarageId, serviceId).subscribe(() => {
        this.loadGarageServices(this.selectedGarageId!);
      });
    }
  }
}
