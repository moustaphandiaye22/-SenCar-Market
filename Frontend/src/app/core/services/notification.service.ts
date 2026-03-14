import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  estLue: boolean;
  dateCreation: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);

  getNotifications(userId: string, page = 0, size = 10): Observable<{ content: Notification[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<{ content: Notification[]; total: number }>(`/notifications/utilisateur/${userId}`, params);
  }

  getUnreadCount(userId: string): Observable<{ unreadCount: number }> {
    return this.api.get<{ unreadCount: number }>(`/notifications/utilisateur/${userId}/count/unread`);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.api.put<Notification>(`/notifications/${id}/read`, {});
  }

  markAllAsRead(userId: string): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(`/notifications/utilisateur/${userId}/read-all`, {});
  }

  deleteNotification(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/notifications/${id}`);
  }
}
