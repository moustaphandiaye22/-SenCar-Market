import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface ProduitAssurance {
  id: string;
  nom: string;
  description: string;
  prixBase: string;
  typeAssurance: string;
  dureeMois: number;
  estActif: boolean;
  options?: OptionAssurance[];
}

export interface OptionAssurance {
  id: string;
  nom: string;
  description: string;
  prixSupplementaire: string;
  estActif: boolean;
}

export interface SouscriptionAssurance {
  id: string;
  utilisateurId: string;
  produitAssuranceId: string;
  vehiculeId: string;
  statut: string;
  montantTotal: string;
  dateDebut: string;
  dateFin: string;
  numeroContrat?: string;
  documentUrl?: string;
  paiementId?: string;
  produit?: ProduitAssurance;
}

@Injectable({
  providedIn: 'root'
})
export class AssuranceService {
  private api = inject(ApiService);

  getProduitsActifs(): Observable<ProduitAssurance[]> {
    return this.api.get('/assurance/produits/actifs');
  }

  getOptionsByProduit(produitId: string): Observable<OptionAssurance[]> {
    return this.api.get(`/assurance/produits/${produitId}/options`);
  }

  getProduitById(id: string): Observable<ProduitAssurance> {
    return this.api.get(`/assurance/produits/${id}`);
  }

  calculatePrix(produitId: string, optionIds: string[]): Observable<any> {
    let params = new HttpParams().set('produitAssuranceId', produitId);
    if (optionIds && optionIds.length > 0) {
      optionIds.forEach(id => {
        params = params.append('optionIds', id);
      });
    }
    return this.api.get('/assurance/calcul-prix', params);
  }

  createSouscription(data: { vehiculeId: string; produitAssuranceId: string; optionIds: string[] }): Observable<SouscriptionAssurance> {
    return this.api.post('/assurance/souscriptions', data);
  }

  getMesSouscriptions(userId: string): Observable<SouscriptionAssurance[]> {
    return this.api.get(`/assurance/souscriptions/utilisateur/${userId}`);
  }

  getSouscription(id: string): Observable<SouscriptionAssurance> {
    return this.api.get(`/assurance/souscriptions/${id}`);
  }

  processPayment(id: string, paiementId: string): Observable<SouscriptionAssurance> {
    const params = new HttpParams().set('paiementId', paiementId);
    return this.api.post(`/assurance/souscriptions/${id}/payment`, {}, params);
  }

  generateContract(id: string): Observable<SouscriptionAssurance> {
    return this.api.post(`/assurance/souscriptions/${id}/contrat`, {});
  }

  uploadDocument(id: string, documentType: string, documentUrl: string): Observable<SouscriptionAssurance> {
    const params = new HttpParams()
      .set('documentType', documentType)
      .set('documentUrl', documentUrl);
    return this.api.post(`/assurance/souscriptions/${id}/documents`, {}, params);
  }
}
