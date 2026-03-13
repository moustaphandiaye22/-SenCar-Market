import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { LucideAngularModule, Car, Home, Search, LogIn, Menu, Contact, Briefcase, User, LogOut, ChevronDown, Plus, Heart } from 'lucide-angular';

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
export class AppComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;
  
  icons = { Car, Home, Search, LogIn, Menu, Contact, Briefcase, User, LogOut, ChevronDown, Plus, Heart };

  logout() {
    this.authService.logout();
  }
}
