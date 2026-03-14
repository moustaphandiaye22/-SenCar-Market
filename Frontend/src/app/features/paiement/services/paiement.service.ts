import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

export interface Portefeuille {
  id: string;
  solde: string;
  soldeBloque: string;
  isActif: boolean;
  dateDerniereRecharge?: string;
}

export interface Paiement {
  id: string;
  montant: string;
  statut: string;
  methodePaiement: string;
  referenceTransaction: string;
  dateCreation: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private api = inject(ApiService);

  getPortefeuille(userId: string): Observable<Portefeuille> {
    return this.api.get(`/paiements/portefeuille/utilisateur/${userId}`);
  }

  createPaiement(data: { reservationId?: string; montant: number; methodePaiement: string }): Observable<Paiement> {
    return this.api.post('/paiements', data);
  }

  createPaiementWave(data: any): Observable<Paiement> {
    return this.api.post('/paiements/wave', data);
  }

  getMesPaiements(userId: string): Observable<Paiement[]> {
    return this.api.get(`/paiements/utilisateur/${userId}`);
  }

  getTransactions(userId: string): Observable<any[]> {
    return this.api.get(`/paiements/transactions/utilisateur/${userId}`);
  }
}
