import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface Message {
  id: string;
  contenu: string;
  expediteurId: string;
  conversationId: string;
  dateEnvoi: string;
  estLu: boolean;
  estEpingle: boolean;
  expediteur?: {
    prenom: string;
    nom: string;
  };
}

export interface Conversation {
  id: string;
  titre?: string;
  dernierMessage?: Message;
  dateCreation: string;
  dateDerniereActivite: string;
  unreadCount?: number;
  participants: Array<{
    id: string;
    utilisateur: {
      id: string;
      prenom: string;
      nom: string;
      email: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private api = inject(ApiService);

  getConversations(page = 0, size = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get('/messagerie/conversations', params);
  }

  getConversation(id: string): Observable<Conversation> {
    return this.api.get(`/messagerie/conversations/${id}`);
  }

  getMessages(conversationId: string, page = 0, size = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get(`/messagerie/conversations/${conversationId}/messages`, params);
  }

  sendMessage(conversationId: string, contenu: string): Observable<Message> {
    return this.api.post('/messagerie/messages', { conversationId, contenu });
  }

  createConversation(destinataireId: string, titre?: string): Observable<Conversation> {
    return this.api.post('/messagerie/conversations', { participantIds: [destinataireId], titre });
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.api.put(`/messagerie/conversations/${conversationId}/read`, {});
  }

  leaveConversation(conversationId: string): Observable<void> {
    return this.api.post(`/messagerie/conversations/${conversationId}/leave`, {});
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): Observable<void> {
    const params = new HttpParams().set('isTyping', isTyping.toString());
    return this.api.post(`/messagerie/conversations/${conversationId}/typing`, {}, undefined);
  }

  searchConversations(query: string): Observable<Conversation[]> {
    const params = new HttpParams().set('query', query);
    return this.api.get('/messagerie/conversations/search', params);
  }

  getParticipants(conversationId: string): Observable<any[]> {
    return this.api.get(`/messagerie/conversations/${conversationId}/participants`);
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.api.delete(`/messagerie/messages/${messageId}`);
  }

  pinMessage(messageId: string): Observable<Message> {
    return this.api.put(`/messagerie/messages/${messageId}/pin`, {});
  }

  searchMessages(conversationId: string, query: string, page = 0, size = 50): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get(`/messagerie/conversations/${conversationId}/messages/search`, params);
  }
}
