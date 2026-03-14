import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DemandeTradeIn, Estimation, CreateTradeInRequest, ValidationTradeInRequest } from '../models/trade-in.model';

@Injectable({
  providedIn: 'root'
})
export class TradeInService {
  private apiUrl = `${environment.apiUrl}/tradein`;

  constructor(private http: HttpClient) {}

  createDemande(request: CreateTradeInRequest): Observable<DemandeTradeIn> {
    return this.http.post<DemandeTradeIn>(`${this.apiUrl}/demandes`, request);
  }

  getMesDemandes(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/demandes`, { params });
  }

  getDemandeById(id: string): Observable<DemandeTradeIn> {
    return this.http.get<DemandeTradeIn>(`${this.apiUrl}/demandes/${id}`);
  }

  estimerVehicule(request: any): Observable<Estimation> {
    return this.http.post<Estimation>(`${this.apiUrl}/estimation`, request);
  }

  deleteDemande(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/demandes/${id}`);
  }

  getDemandesNonNotifiees(): Observable<DemandeTradeIn[]> {
    return this.http.get<DemandeTradeIn[]>(`${this.apiUrl}/demandes/non-notifiees`);
  }

  getDemandesByUtilisateur(utilisateurId: string): Observable<DemandeTradeIn[]> {
    return this.http.get<DemandeTradeIn[]>(`${this.apiUrl}/demandes/utilisateur/${utilisateurId}`);
  }

  updateDemande(id: string, request: CreateTradeInRequest): Observable<DemandeTradeIn> {
    return this.http.put<DemandeTradeIn>(`${this.apiUrl}/demandes/${id}`, request);
  }

  calculerEstimationAuto(id: string): Observable<DemandeTradeIn> {
    return this.http.post<DemandeTradeIn>(`${this.apiUrl}/demandes/${id}/calculer-estimation`, {});
  }

  validerDemande(id: string, request: ValidationTradeInRequest): Observable<DemandeTradeIn> {
    return this.http.post<DemandeTradeIn>(`${this.apiUrl}/demandes/${id}/validation`, request);
  }

  updateStatut(id: string, statut: string): Observable<DemandeTradeIn> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<DemandeTradeIn>(`${this.apiUrl}/demandes/${id}/statut`, {}, { params });
  }

  notifierUtilisateur(id: string): Observable<DemandeTradeIn> {
    return this.http.post<DemandeTradeIn>(`${this.apiUrl}/demandes/${id}/notifier`, {});
  }
}
