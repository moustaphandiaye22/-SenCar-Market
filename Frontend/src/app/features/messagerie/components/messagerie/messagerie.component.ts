import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagerieService, Conversation, Message } from '../../services/messagerie.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, Send, Search, User, MoreVertical, Paperclip, CheckCircle2, Phone, Video, Info, Trash2, Pin, Users, ArrowLeft, MessageSquare, RefreshCcw } from 'lucide-angular';
import { Subscription, interval, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.css']
})
export class MessagerieComponent implements OnInit, OnDestroy {
  private messagerieService = inject(MessagerieService);
  private authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;
  conversations: Conversation[] = [];
  selectedConversation?: Conversation;
  messages: Message[] = [];
  newMessage = '';
  searchQuery = '';
  isLoading = false;
  isSending = false;
  showParticipants = false;
  participants: any[] = [];
  
  icons = { 
    Send, Search, User, MoreVertical, Paperclip, CheckCircle2, 
    Phone, Video, Info, Trash2, Pin, Users, ArrowLeft, MessageSquare, RefreshCcw 
  };
  
  private refreshSubscription?: Subscription;
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadConversations();
    
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });

    // Auto-refresh messages only when a conversation is selected
    this.refreshSubscription = interval(5000).subscribe(() => {
      if (this.selectedConversation) {
        this.loadMessages(this.selectedConversation.id, false);
      }
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string) {
    if (!query.trim()) {
      this.loadConversations(false);
      return;
    }
    this.messagerieService.searchConversations(query).subscribe(res => {
      this.conversations = res;
    });
  }

  loadConversations(showLoading = true) {
    if (showLoading) this.isLoading = true;
    this.messagerieService.getConversations().subscribe({
      next: (res) => {
        this.conversations = res.content;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation = conv;
    this.showParticipants = false;
    this.loadMessages(conv.id);
    this.messagerieService.markAsRead(conv.id).subscribe();
  }

  loadMessages(convId: string, showLoading = true) {
    this.messagerieService.getMessages(convId).subscribe({
      next: (res) => {
        // Only update if message count changed or first load
        if (res.content.length !== this.messages.length) {
          this.messages = res.content.reverse();
          this.scrollToBottom();
        }
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation || this.isSending) return;

    const content = this.newMessage;
    this.newMessage = '';
    this.isSending = true;

    this.messagerieService.sendMessage(this.selectedConversation.id, content).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.isSending = false;
        this.scrollToBottom();
      },
      error: () => this.isSending = false
    });
  }

  toggleParticipants() {
    this.showParticipants = !this.showParticipants;
    if (this.showParticipants && this.selectedConversation) {
      this.messagerieService.getParticipants(this.selectedConversation.id).subscribe(res => {
        this.participants = res;
      });
    }
  }

  deleteMessage(messageId: string) {
    if (confirm('Supprimer ce message ?')) {
      this.messagerieService.deleteMessage(messageId).subscribe(() => {
        this.messages = this.messages.filter(m => m.id !== messageId);
      });
    }
  }

  pinMessage(msg: Message) {
    this.messagerieService.pinMessage(msg.id).subscribe(updated => {
      const idx = this.messages.findIndex(m => m.id === msg.id);
      if (idx !== -1) this.messages[idx].estEpingle = updated.estEpingle;
    });
  }

  getParticipantName(conv: Conversation): string {
    const me = this.authService.getUser();
    const other = conv.participants.find(p => p.utilisateurId !== me?.id);
    return other ? other.utilisateurNom : (conv.titre || 'Groupe');
  }

  getOtherParticipantInitials(conv: Conversation): string {
    const me = this.authService.getUser();
    const other = conv.participants.find(p => p.utilisateurId !== me?.id);
    if (!other) return conv.titre ? conv.titre[0].toUpperCase() : 'G';
    const names = other.utilisateurNom.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return other.utilisateurNom[0].toUpperCase();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
