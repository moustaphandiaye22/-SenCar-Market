import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { BehaviorSubject, tap, map, Observable, distinctUntilChanged } from 'rxjs';
import { AuthResponse, UserProfile } from '../models/auth.model';

// Shape of the raw API response from the backend
interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  utilisateur: {
    id: string;
    email: string;
    typeUtilisateur: string;
    prenom: string;
    nom: string;
    telephone?: string;
    emailVerifie: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private currentUserSubject = new BehaviorSubject<AuthResponse['user'] | null>(this.getSavedUser());
  
  public currentUser$ = this.currentUserSubject.asObservable().pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  private getSavedUser(): AuthResponse['user'] | null {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  getUser(): AuthResponse['user'] | null {
    return this.currentUserValue;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  login(credentials: { email: string; motDePasse: string }): Observable<AuthResponse> {
    const payload = { identifiant: credentials.email, motDePasse: credentials.motDePasse };
    return this.api.post<BackendAuthResponse>('/auth/login', payload).pipe(
      map(resp => this.mapBackendResponse(resp)),
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.api.post<BackendAuthResponse>('/auth/register', userData).pipe(
      map(resp => this.mapBackendResponse(resp)),
      tap(response => this.handleAuthResponse(response))
    );
  }

  verifyOtp(email: string, codeOtp: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/verify-otp', { email, codeOtp });
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/resend-otp', { email });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(data: { email: string; codeOtp: string; nouveauMotDePasse: string }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/reset-password', data);
  }

  /** DEV ONLY – récupère le dernier OTP depuis la BD directement (endpoint backend dev) */
  devGetOtp(email: string): Observable<{ code: string; type: string; email: string }> {
    return this.api.get<{ code: string; type: string; email: string }>('/auth/dev/otp', new HttpParams().set('email', email));
  }

  getMe(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/auth/me').pipe(
      tap(user => {
        const current = this.getSavedUser();
        if (current) {
          const updated = { ...current, ...user };
          localStorage.setItem('user', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      })
    );
  }

  updateProfile(data: any): Observable<UserProfile> {
    return this.api.put<UserProfile>('/auth/profile', data).pipe(
      tap(user => {
        const current = this.getSavedUser();
        if (current) {
          const updated = { ...current, ...user };
          localStorage.setItem('user', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      })
    );
  }

  changePassword(data: { ancienMotDePasse: string; nouveauMotDePasse: string }): Observable<void> {
    return this.api.post<void>('/auth/change-password', data);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.api.post<BackendAuthResponse>('/auth/refresh', { refreshToken }).pipe(
      map(resp => this.mapBackendResponse(resp)),
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  private mapBackendResponse(resp: BackendAuthResponse): AuthResponse {
    return {
      accessToken: resp.accessToken,
      refreshToken: resp.refreshToken,
      user: {
        id: resp.utilisateur.id,
        email: resp.utilisateur.email,
        role: resp.utilisateur.typeUtilisateur,
        prenom: resp.utilisateur.prenom,
        nom: resp.utilisateur.nom,
      }
    };
  }

  private handleAuthResponse(response: AuthResponse) {
    if (response && response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
  }
}
