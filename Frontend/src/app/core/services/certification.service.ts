import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface DemandeCertification {
  id: string;
  utilisateurId: string;
  vehiculeId: string;
  statut: string;
  dateCreation: string;
  montantPaiement: number;
  inspecteurId?: string;
  paiementId?: string;
  vehicule?: any;
}

export interface Inspection {
  id: string;
  demandeId: string;
  inspecteurId: string;
  datePrevue: string;
  dateEffective?: string;
  statut: string;
  notes?: string;
  rapportUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificationService {
  private api = inject(ApiService);

  createDemande(data: {
    vehiculeId: string;
  }): Observable<DemandeCertification> {
    return this.api.post<DemandeCertification>(
      '/certifications/demandes',
      data,
    );
  }

  getAllDemandes(
    page = 0,
    size = 10,
  ): Observable<{ content: DemandeCertification[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: DemandeCertification[]; total: number }>(
      '/certifications/demandes',
      params,
    );
  }

  getDemandesByUtilisateur(
    utilisateurId: string,
  ): Observable<DemandeCertification[]> {
    return this.api.get<DemandeCertification[]>(
      `/certifications/demandes/utilisateur/${utilisateurId}`,
    );
  }

  getDemandeById(id: string): Observable<DemandeCertification> {
    return this.api.get<DemandeCertification>(`/certifications/demandes/${id}`);
  }

  processPayment(
    demandeId: string,
    paiementId: string,
  ): Observable<DemandeCertification> {
    const params = new HttpParams().set('paiementId', paiementId);
    return this.api.post<DemandeCertification>(
      `/certifications/demandes/${demandeId}/payment`,
      {},
      params,
    );
  }

  assignInspector(
    demandeId: string,
    inspecteurId: string,
  ): Observable<DemandeCertification> {
    const params = new HttpParams().set('inspecteurId', inspecteurId);
    return this.api.post<DemandeCertification>(
      `/certifications/demandes/${demandeId}/assign-inspector`,
      {},
      params,
    );
  }

  updateStatut(
    demandeId: string,
    statut: string,
  ): Observable<DemandeCertification> {
    const params = new HttpParams().set('statut', statut);
    return this.api.patch<DemandeCertification>(
      `/certifications/demandes/${demandeId}/statut`,
      {},
      params,
    );
  }

  createInspection(demandeId: string, data: any): Observable<Inspection> {
    return this.api.post<Inspection>(
      `/certifications/demandes/${demandeId}/inspections`,
      data,
    );
  }

  getInspectionById(id: string): Observable<Inspection> {
    return this.api.get<Inspection>(`/certifications/inspections/${id}`);
  }

  getInspectionsByInspecteur(
    inspecteurId: string,
    page = 0,
    size = 10,
  ): Observable<{ content: Inspection[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: Inspection[]; total: number }>(
      `/certifications/inspections/inspecteur/${inspecteurId}`,
      params,
    );
  }

  updateInspection(id: string, data: any): Observable<Inspection> {
    return this.api.put<Inspection>(`/certifications/inspections/${id}`, data);
  }

  deleteInspection(id: string): Observable<void> {
    return this.api.delete<void>(`/certifications/inspections/${id}`);
  }

  saveRapportResult(
    inspectionId: string,
    request: any,
  ): Observable<Inspection> {
    return this.api.post<Inspection>(
      `/certifications/inspections/${inspectionId}/resultat`,
      request,
    );
  }

  generateBadge(demandeId: string): Observable<DemandeCertification> {
    return this.api.post<DemandeCertification>(
      `/certifications/demandes/${demandeId}/generate-badge`,
      {},
    );
  }

  // Admin aliases
  getDemandesForAdmin(): Observable<DemandeCertification[]> {
    return this.api
      .get<{ content: DemandeCertification[] }>('/certifications/demandes')
      .pipe(map((response) => response.content || []));
  }

  validerDemande(id: string): Observable<DemandeCertification> {
    return this.updateStatut(id, 'CERTIFIEE');
  }

  rejeterDemande(id: string, raison: string): Observable<DemandeCertification> {
    return this.api.patch<DemandeCertification>(
      `/certifications/demandes/${id}/statut`,
      { statut: 'REJETEE', motifRejet: raison },
    );
  }
}
