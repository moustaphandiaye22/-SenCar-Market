import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { ToastComponent } from './core/components/toast/toast.component';
import { ConfirmDialogComponent } from './core/components/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent } from './core/components/prompt-dialog/prompt-dialog.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { LucideAngularModule, Car, Home, Search, LogIn, Menu, X, Contact, Briefcase, User, LogOut, ChevronDown, Plus, Heart, Wrench, RefreshCcw, Key, Settings, LayoutDashboard, Bell, MessageSquare, Zap, ShieldCheck, Verified } from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    ToastComponent,
    ConfirmDialogComponent,
    PromptDialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  currentUser$ = this.authService.currentUser$;
  
  icons = { 
    Car, Home, Search, LogIn, Menu, X, Contact, Briefcase, User, LogOut, 
    ChevronDown, Plus, Heart, Wrench, RefreshCcw, Key, Settings, 
    LayoutDashboard, Bell, MessageSquare, Zap, ShieldCheck, Verified
  };

  isUserDropdownOpen = false;
  isServicesDropdownOpen = false;
  isMobileMenuOpen = false;
  unreadCount = 0;
  isAdminRoute = false;

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.loadUnreadCount(user.id);
      }
    });
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isAdminRoute = (e.urlAfterRedirects as string).startsWith('/admin');
      this.isMobileMenuOpen = false;
      this.isUserDropdownOpen = false;
    });
  }

  loadUnreadCount(userId: string) {
    this.notificationService.getUnreadCount(userId).subscribe(res => {
      this.unreadCount = res.unreadCount;
    });
  }

  getDashboardLink(): string {
    return this.authService.currentUserValue?.role === 'ADMIN' ? '/admin' : '/dashboard';
  }

  getDashboardQueryParams(): Record<string, string> | null {
    return this.authService.currentUserValue?.role === 'ADMIN' ? null : { tab: 'reservations' };
  }

  getNotifLink(): string {
    return this.authService.currentUserValue?.role === 'ADMIN' ? '/admin/notifications' : '/dashboard';
  }

  getNotifQueryParams(): Record<string, string> | null {
    return this.authService.currentUserValue?.role === 'ADMIN' ? null : { tab: 'notifications' };
  }

  getProfileLink(): string {
    return this.authService.currentUserValue?.role === 'ADMIN' ? '/admin/profile' : '/dashboard';
  }

  getProfileQueryParams(): Record<string, string> | null {
    return this.authService.currentUserValue?.role === 'ADMIN' ? null : { tab: 'profile' };
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isServicesDropdownOpen = false;
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  toggleServicesDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = false;
    this.isServicesDropdownOpen = !this.isServicesDropdownOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.isUserDropdownOpen = false;
    this.isServicesDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isUserDropdownOpen = false;
  }
}
