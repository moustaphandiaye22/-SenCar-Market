import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule, Bell, CheckCircle2, Trash2, Info, AlertTriangle, MessageSquare, Briefcase, Car } from 'lucide-angular';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-list.component.html'
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  notifications: Notification[] = [];
  isLoading = true;
  icons = { 
    Bell, CheckCircle2, Trash2, Info, AlertTriangle, 
    MessageSquare, Briefcase, Car 
  };

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.loadNotifications(user.id);
    }
  }

  loadNotifications(userId: string) {
    this.notificationService.getNotifications(userId).subscribe({
      next: (res) => {
        this.notifications = res.content;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  markAsRead(notif: Notification) {
    if (notif.estLue) return;
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      notif.estLue = true;
    });
  }

  markAllAsRead() {
    const user = this.authService.getUser();
    if (user) {
      this.notificationService.markAllAsRead(user.id).subscribe(() => {
        this.notifications.forEach(n => n.estLue = true);
      });
    }
  }

  deleteNotification(id: string) {
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    });
  }

  getTypeIcon(type: string) {
    switch (type) {
      case 'MESSAGE': return this.icons.MessageSquare;
      case 'TRANSACTION': return this.icons.Briefcase;
      case 'VEHICULE': return this.icons.Car;
      case 'URGENT': return this.icons.AlertTriangle;
      default: return this.icons.Info;
    }
  }

  getTypeColor(type: string) {
    switch (type) {
      case 'MESSAGE': return 'bg-blue-50 text-blue-600';
      case 'TRANSACTION': return 'bg-green-50 text-green-600';
      case 'URGENT': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  }
}
