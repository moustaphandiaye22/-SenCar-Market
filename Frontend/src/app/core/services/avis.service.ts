import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface Avis {
  id: string;
  note: number;
  commentaire: string;
  typeAvis: string;
  auteurId: string;
  dateCreation: string;
  auteur?: {
    prenom: string;
    nom: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private api = inject(ApiService);

  getAvisByVehicule(vehiculeId: string, page = 0, size = 10): Observable<{ content: Avis[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: Avis[]; total: number }>(`/avis/vehicule/${vehiculeId}`, params);
  }

  getAvisByGarage(garageId: string, page = 0, size = 10): Observable<{ content: Avis[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: Avis[]; total: number }>(`/avis/garage/${garageId}`, params);
  }

  createAvis(data: { note: number; commentaire: string; typeAvis: string; cibleId: string }): Observable<Avis> {
    return this.api.post<Avis>('/avis', data);
  }

  getNoteMoyenneVehicule(vehiculeId: string): Observable<number> {
    return this.api.get<number>(`/avis/vehicule/${vehiculeId}/moyenne`);
  }

  getNoteMoyenneGarage(garageId: string): Observable<number> {
    return this.api.get<number>(`/avis/garage/${garageId}/moyenne`);
  }

  getAllAvis(page = 0, size = 10): Observable<{ content: Avis[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: Avis[]; total: number }>('/avis', params);
  }

  getAvisById(id: string): Observable<Avis> {
    return this.api.get<Avis>(`/avis/${id}`);
  }

  getAvisByUtilisateur(utilisateurId: string, page = 0, size = 10): Observable<{ content: Avis[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: Avis[]; total: number }>(`/avis/utilisateur/${utilisateurId}`, params);
  }

  getNoteMoyenneUtilisateur(utilisateurId: string): Observable<number> {
    return this.api.get<number>(`/avis/utilisateur/${utilisateurId}/moyenne`);
  }

  signalerAvis(id: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(`/avis/${id}/signaler`, {});
  }

  deleteAvis(id: string): Observable<void> {
    return this.api.delete<void>(`/avis/${id}`);
  }

  isTransactionValide(transactionId: string, typeAvis: string): Observable<boolean> {
    const params = new HttpParams().set('typeAvis', typeAvis);
    return this.api.get<boolean>(`/avis/transaction/${transactionId}/validation`, params);
  }
}
