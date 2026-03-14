import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { LucideAngularModule, Car, Home, Search, LogIn, Menu, Contact, Briefcase, User, LogOut, ChevronDown, Plus, Heart, Wrench, RefreshCcw, Key, Settings, LayoutDashboard, Bell, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  currentUser$ = this.authService.currentUser$;
  
  icons = { 
    Car, Home, Search, LogIn, Menu, Contact, Briefcase, User, LogOut, 
    ChevronDown, Plus, Heart, Wrench, RefreshCcw, Key, Settings, 
    LayoutDashboard, Bell, MessageSquare 
  };

  isUserDropdownOpen = false;
  unreadCount = 0;

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.loadUnreadCount(user.id);
      }
    });
  }

  loadUnreadCount(userId: string) {
    this.notificationService.getUnreadCount(userId).subscribe(res => {
      this.unreadCount = res.unreadCount;
    });
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.isUserDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isUserDropdownOpen = false;
  }
}
