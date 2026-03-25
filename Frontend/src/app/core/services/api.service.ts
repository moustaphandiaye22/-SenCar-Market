import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get<T>(path: string, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`, { params, headers });
  }

  post<T>(path: string, body: any, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, body, { params, headers });
  }

  put<T>(path: string, body: any, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body, { params, headers });
  }

  delete<T>(path: string, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${path}`, { params, headers });
  }

  patch<T>(path: string, body: any, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${path}`, body, { params, headers });
  }
}
