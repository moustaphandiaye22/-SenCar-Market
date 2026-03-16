import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private api = inject(ApiService);

  getDashboardStats(): Observable<any> {
    return this.api.get('/admin/dashboard/stats');
  }

  getUtilisateurs(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.api.get('/admin/utilisateurs', params);
  }

  getUtilisateurById(id: string): Observable<any> {
    return this.api.get(`/admin/utilisateurs/${id}`);
  }

  suspendreUtilisateur(id: string, raison: string): Observable<any> {
    const params = new HttpParams().set('raison', raison);
    return this.api.post(`/admin/utilisateurs/${id}/suspendre`, {}, params);
  }

  reactiverUtilisateur(id: string): Observable<any> {
    return this.api.post(`/admin/utilisateurs/${id}/reactiver`, {});
  }

  bannirUtilisateur(id: string, raison: string): Observable<any> {
    const params = new HttpParams().set('raison', raison);
    return this.api.delete(`/admin/utilisateurs/${id}/ban`, params);
  }

  modifierRole(id: string, role: string): Observable<any> {
    return this.api.put(`/admin/utilisateurs/${id}/role`, { nouveauRole: role });
  }

  getAnnonces(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.api.get('/admin/annonces', params);
  }

  validerAnnonce(id: string): Observable<any> {
    return this.api.post(`/admin/annonces/${id}/valider`, {});
  }

  desactiverAnnonce(id: string, raison: string): Observable<any> {
    const params = new HttpParams().set('raison', raison);
    return this.api.post(`/admin/annonces/${id}/desactiver`, {}, params);
  }

  supprimerAnnonce(id: string): Observable<any> {
    return this.api.delete(`/admin/annonces/${id}`);
  }

  getTransactions(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.api.get('/admin/transactions', params);
  }

  getTransactionsByUtilisateur(utilisateurId: string, page = 0, size = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get(`/admin/utilisateurs/${utilisateurId}/transactions`, params);
  }

  getTotalCommissions(): Observable<number> {
    return this.api.get('/admin/commissions');
  }

  effectuerRemboursement(transactionId: string, raison: string): Observable<any> {
    const params = new HttpParams().set('raison', raison);
    return this.api.post(`/admin/transactions/${transactionId}/rembourser`, {}, params);
  }

  notifierTous(titre: string, message: string): Observable<any> {
    const params = new HttpParams()
      .set('titre', titre)
      .set('message', message);
    return this.api.post('/admin/notifications/broadcast', {}, params);
  }

  notifierGroupe(utilisateurIds: string[], titre: string, message: string): Observable<any> {
    let params = new HttpParams()
      .set('titre', titre)
      .set('message', message);
    
    utilisateurIds.forEach(id => {
      params = params.append('utilisateurIds', id);
    });

    return this.api.post('/admin/notifications/groupe', {}, params);
  }
}
