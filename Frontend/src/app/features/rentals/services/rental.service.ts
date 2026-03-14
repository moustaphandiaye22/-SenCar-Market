import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnnonceLocation, ReservationLocation, DisponibiliteLocation } from '../models/rental.model';

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  getAllAnnonces(): Observable<AnnonceLocation[]> {
    return this.http.get<AnnonceLocation[]>(`${this.apiUrl}/annonces`);
  }

  getAnnonceById(id: string): Observable<AnnonceLocation> {
    return this.http.get<AnnonceLocation>(`${this.apiUrl}/annonces/${id}`);
  }

  createReservation(request: any): Observable<ReservationLocation> {
    return this.http.post<ReservationLocation>(`${this.apiUrl}/reservations`, request);
  }

  getMesReservations(): Observable<ReservationLocation[]> {
    return this.http.get<ReservationLocation[]>(`${this.apiUrl}/mes-reservations`);
  }

  getDisponibilites(annonceId: string): Observable<DisponibiliteLocation[]> {
    return this.http.get<DisponibiliteLocation[]>(`${this.apiUrl}/annonces/${annonceId}/disponibilites`);
  }

  createAnnonce(request: any): Observable<AnnonceLocation> {
    return this.http.post<AnnonceLocation>(`${this.apiUrl}/annonces`, request);
  }

  updateAnnonce(id: string, request: any): Observable<AnnonceLocation> {
    return this.http.put<AnnonceLocation>(`${this.apiUrl}/annonces/${id}`, request);
  }

  cancelReservation(id: string, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations/${id}/annuler`, { motif: reason });
  }

  getMesAnnonces(): Observable<AnnonceLocation[]> {
    return this.http.get<AnnonceLocation[]>(`${this.apiUrl}/mes-annonces`);
  }

  deleteAnnonce(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/annonces/${id}`);
  }

  activerAnnonce(id: string): Observable<AnnonceLocation> {
    return this.http.post<AnnonceLocation>(`${this.apiUrl}/annonces/${id}/activer`, {});
  }

  desactiverAnnonce(id: string): Observable<AnnonceLocation> {
    return this.http.post<AnnonceLocation>(`${this.apiUrl}/annonces/${id}/desactiver`, {});
  }

  updateStatutReservation(id: string, statut: string): Observable<ReservationLocation> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put<ReservationLocation>(`${this.apiUrl}/reservations/${id}/statut`, {}, { params });
  }

  getReservationById(id: string): Observable<ReservationLocation> {
    return this.http.get<ReservationLocation>(`${this.apiUrl}/reservations/${id}`);
  }

  getReservationsByAnnonce(id: string): Observable<ReservationLocation[]> {
    return this.http.get<ReservationLocation[]>(`${this.apiUrl}/annonces/${id}/reservations`);
  }

  ajouterDisponibilites(id: string, request: any[]): Observable<DisponibiliteLocation[]> {
    return this.http.post<DisponibiliteLocation[]>(`${this.apiUrl}/annonces/${id}/disponibilites`, request);
  }

  supprimerDisponibilites(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/annonces/${id}/disponibilites`);
  }

  getHistoriqueStatuts(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/${id}/historique`);
  }

  updateStatutReservationAvecHistorique(id: string, statut: string): Observable<ReservationLocation> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put<ReservationLocation>(`${this.apiUrl}/reservations/${id}/statut-avec-historique`, {}, { params });
  }
}
