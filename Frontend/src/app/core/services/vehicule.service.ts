import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { VehiculeResponse, PaginatedVehiculeResponse, VehiculeFilter } from '../models/vehicule.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private api = inject(ApiService);

  searchVehicules(filter?: VehiculeFilter): Observable<PaginatedVehiculeResponse> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const val = (filter as any)[key];
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, val.toString());
        }
      });
    }
    return this.api.get<PaginatedVehiculeResponse>('/vehicules', params);
  }

  getVehiculeById(id: string): Observable<VehiculeResponse> {
    return this.api.get<VehiculeResponse>(`/vehicules/${id}`);
  }

  getMesVehicules(): Observable<VehiculeResponse[]> {
    return this.api.get<VehiculeResponse[]>('/vehicules/moi');
  }

  getMesFavoris(): Observable<VehiculeResponse[]> {
    return this.api.get<VehiculeResponse[]>('/vehicules/favoris/moi');
  }

  createVehicule(vehicule: any): Observable<VehiculeResponse> {
    return this.api.post<VehiculeResponse>('/vehicules', vehicule);
  }

  updateVehicule(id: string, vehicule: any): Observable<VehiculeResponse> {
    return this.api.put<VehiculeResponse>(`/vehicules/${id}`, vehicule);
  }

  deleteVehicule(id: string): Observable<void> {
    return this.api.delete<void>(`/vehicules/${id}`);
  }

  publishVehicule(id: string): Observable<VehiculeResponse> {
    return this.api.put<VehiculeResponse>(`/vehicules/${id}/publish`, {});
  }

  addToFavoris(id: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(`/vehicules/${id}/favoris`, {});
  }

  removeFromFavoris(id: string): Observable<void> {
    return this.api.delete<void>(`/vehicules/${id}/favoris`);
  }

  boostVehicule(id: string, debut: string, fin: string): Observable<VehiculeResponse> {
    return this.api.post<VehiculeResponse>(`/vehicules/${id}/boost?debut=${debut}&fin=${fin}`, {});
  }

  uploadPhotos(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return this.api.post<string[]>('/vehicules/upload', formData);
  }

  getMarques(): Observable<{ id: string, nom: string }[]> {
    return this.api.get<{ id: string, nom: string }[]>('/vehicules/references/marques');
  }

  getModeles(marqueId: string): Observable<{ id: string, nom: string }[]> {
    return this.api.get<{ id: string, nom: string }[]>(`/vehicules/references/marques/${marqueId}/modeles`);
  }

  getCarburants(): Observable<{ id: string, nom: string }[]> {
    return this.api.get<{ id: string, nom: string }[]>('/vehicules/references/carburants');
  }

  getBoiteVitesses(): Observable<{ id: string, nom: string }[]> {
    return this.api.get<{ id: string, nom: string }[]>('/vehicules/references/boite-vitesses');
  }
}
