import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Garage, ServiceGarage, GarageServiceAssociation } from '../models/garage.model';

@Injectable({
  providedIn: 'root'
})
export class GarageService {
  private apiUrl = `${environment.apiUrl}/garages`;

  constructor(private http: HttpClient) {}

  getAllGarages(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getActiveGarages(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/actifs`, { params });
  }

  getGarageById(id: string): Observable<Garage> {
    return this.http.get<Garage>(`${this.apiUrl}/${id}`);
  }

  getGaragesByVille(ville: string): Observable<Garage[]> {
    return this.http.get<Garage[]>(`${this.apiUrl}/search/ville`, { params: { ville } });
  }

  searchGarages(q: string): Observable<Garage[]> {
    return this.http.get<Garage[]>(`${this.apiUrl}/search`, { params: { q } });
  }

  getServicesByGarage(garageId: string): Observable<GarageServiceAssociation[]> {
    return this.http.get<GarageServiceAssociation[]>(`${this.apiUrl}/${garageId}/services`);
  }

  createGarage(garage: any): Observable<Garage> {
    return this.http.post<Garage>(this.apiUrl, garage);
  }

  updateGarage(id: string, garage: any): Observable<Garage> {
    return this.http.put<Garage>(`${this.apiUrl}/${id}`, garage);
  }

  deleteGarage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGaragesEnAttente(page = 0, size = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/en-attente`, { params });
  }

  getGaragesByProprietaire(proprietaireId: string): Observable<Garage[]> {
    return this.http.get<Garage[]>(`${this.apiUrl}/proprietaire/${proprietaireId}`);
  }

  searchByProximity(latitude: number, longitude: number, rayonKm = 10): Observable<Garage[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('rayonKm', rayonKm.toString());
    return this.http.get<Garage[]>(`${this.apiUrl}/search/proximity`, { params });
  }

  validerGarage(id: string, request: any): Observable<Garage> {
    return this.http.post<Garage>(`${this.apiUrl}/${id}/validate`, request);
  }

  updateLogo(id: string, logoUrl: string): Observable<Garage> {
    return this.http.put<Garage>(`${this.apiUrl}/${id}/logo`, { logoUrl });
  }

  createService(request: any): Observable<ServiceGarage> {
    return this.http.post<ServiceGarage>(`${this.apiUrl}/services`, request);
  }

  getAllServices(): Observable<ServiceGarage[]> {
    return this.http.get<ServiceGarage[]>(`${this.apiUrl}/services`);
  }

  getServiceById(id: string): Observable<ServiceGarage> {
    return this.http.get<ServiceGarage>(`${this.apiUrl}/services/${id}`);
  }

  associateService(garageId: string, request: any): Observable<GarageServiceAssociation> {
    return this.http.post<GarageServiceAssociation>(`${this.apiUrl}/${garageId}/services`, request);
  }

  disassociateService(garageId: string, serviceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${garageId}/services/${serviceId}`);
  }
}
