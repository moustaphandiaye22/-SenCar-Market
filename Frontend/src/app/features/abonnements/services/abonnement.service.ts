import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface PlanAbonnement {
  id: string;
  nom: string;
  description: string;
  prixMensuel: string;
  prixAnnuel?: string;
  dureeJours: number;
  nombreAnnonces: number;
  estVedette: boolean;
  estCertifie: boolean;
  nombreBoostsGratuits: number;
  type: string;
  avantages?: string;
}

export interface UtilisateurAbonnement {
  id: string;
  utilisateurId: string;
  abonnementId: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  abonnement?: PlanAbonnement;
}

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private api = inject(ApiService);

  getPlans(): Observable<PlanAbonnement[]> {
    return this.api.get('/abonnements/plans');
  }

  getActiveSubscription(userId: string): Observable<UtilisateurAbonnement> {
    return this.api.get(`/abonnements/utilisateurs/${userId}/actif`);
  }

  subscribe(planId: string, methodePaiement: string): Observable<UtilisateurAbonnement> {
    return this.api.post('/abonnements/souscription', { abonnementId: planId, methodePaiement });
  }

  cancelSubscription(userId: string): Observable<void> {
    return this.api.post(`/abonnements/utilisateurs/${userId}/cancel`, {});
  }

  boostVehicle(vehicleId: string, niveauBoost: string): Observable<any> {
    return this.api.post('/abonnements/boosts', { vehiculeId: vehicleId, niveauBoost });
  }

  renewSubscription(userId: string): Observable<UtilisateurAbonnement> {
    return this.api.post(`/abonnements/utilisateurs/${userId}/renew`, {});
  }

  getSubscriptionsHistory(userId: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get(`/abonnements/utilisateurs/${userId}`, params);
  }

  getPlanById(id: string): Observable<PlanAbonnement> {
    return this.api.get(`/abonnements/plans/${id}`);
  }

  getBoostsByVehicule(vehiculeId: string): Observable<any[]> {
    return this.api.get(`/abonnements/vehicules/${vehiculeId}/boosts`);
  }

  getBoostById(id: string): Observable<any> {
    return this.api.get(`/abonnements/boosts/${id}`);
  }

  deleteBoost(id: string): Observable<void> {
    return this.api.delete(`/abonnements/boosts/${id}`);
  }
}
