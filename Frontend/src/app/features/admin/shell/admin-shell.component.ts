import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Car,
  Building2,
  CreditCard,
  Shield,
  Repeat,
  MessageSquare,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Bell,
  X,
  UserCircle,
} from 'lucide-angular';
import { filter, Subscription } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  icon: any;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Root wrapper -->
    <div class="flex overflow-hidden" style="height:100vh;background:#f1f5f9">

      <!-- ── Mobile overlay ── -->
      <div *ngIf="isMobileOpen()"
           class="fixed inset-0 z-20 lg:hidden"
           style="background:rgba(0,0,0,.55);backdrop-filter:blur(2px)"
           (click)="closeMobile()">
      </div>

      <!-- ══════════════════════════════
           SIDEBAR
      ══════════════════════════════ -->
      <aside class="fixed left-0 z-30 flex flex-col transition-all duration-300 ease-in-out" style="top:0;height:100vh"
             [ngClass]="[sidebarWidthClass(), sidebarTransformClass()]"
             style="background:linear-gradient(180deg,#0d1117 0%,#0f172a 100%)">

        <!-- Logo bar -->
        <div class="flex items-center gap-3 h-16 px-4 flex-shrink-0"
             style="border-bottom:1px solid rgba(255,255,255,.06)">
          <div class="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0"
               style="box-shadow:0 4px 14px rgba(16,185,129,.35)">
            <span class="text-white font-black text-sm tracking-tight">S</span>
          </div>
          <div *ngIf="!isCollapsed()" class="overflow-hidden">
            <p class="text-white font-black text-sm tracking-tight leading-none">SenCar</p>
            <p class="text-emerald-400 font-black leading-none mt-0.5"
               style="font-size:9px;letter-spacing:.2em">ADMIN</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-3 px-2" style="scrollbar-width:none">

          <ng-container *ngFor="let group of navGroups; let first = first">

            <!-- Divider between groups -->
            <div *ngIf="!first" class="my-2 mx-2" style="height:1px;background:rgba(255,255,255,.06)"></div>

            <!-- Group label (only when expanded) -->
            <div *ngIf="!isCollapsed()" class="px-3 pt-1 pb-1.5">
              <span class="font-black text-gray-600 uppercase"
                    style="font-size:9px;letter-spacing:.18em">{{ group.title }}</span>
            </div>

            <!-- Items -->
            <a *ngFor="let item of group.items"
               [routerLink]="item.route"
               routerLinkActive
               #rla="routerLinkActive"
               [routerLinkActiveOptions]="{ exact: !!item.exact }"
               class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer transition-all duration-150 group no-underline"
               [ngClass]="rla.isActive
                 ? 'text-emerald-400'
                 : 'text-gray-500 hover:text-gray-200'"
               [style.background]="rla.isActive ? 'rgba(16,185,129,.12)' : ''">

              <!-- Active left stripe -->
              <span *ngIf="rla.isActive"
                    class="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                    style="width:2px;height:16px;background:#34d399"></span>

              <!-- Icon -->
              <span class="flex-shrink-0 flex items-center justify-center" style="width:18px;height:18px">
                <lucide-angular [img]="item.icon" size="16"></lucide-angular>
              </span>

              <!-- Label -->
              <span *ngIf="!isCollapsed()"
                    class="text-[13px] font-semibold tracking-tight whitespace-nowrap overflow-hidden leading-none">
                {{ item.label }}
              </span>

              <!-- Tooltip (collapsed mode) -->
              <div *ngIf="isCollapsed()"
                   class="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                   style="left:calc(100% + 10px);top:50%;transform:translateY(-50%);
                          background:#1e293b;color:#f1f5f9;font-size:12px;font-weight:600;
                          padding:5px 12px;border-radius:8px;white-space:nowrap;
                          border:1px solid rgba(255,255,255,.08);box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:99">
                {{ item.label }}
                <span style="position:absolute;right:100%;top:50%;transform:translateY(-50%);
                             border:5px solid transparent;border-right-color:#1e293b"></span>
              </div>
            </a>

          </ng-container>
        </nav>

        <!-- Footer -->
        <div class="p-2 flex-shrink-0" style="border-top:1px solid rgba(255,255,255,.06)">

          <!-- Logout -->
          <button (click)="logout()"
                  class="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 transition-all duration-150 group cursor-pointer"
                  style="background:none;border:none"
                  onmouseenter="this.style.background='rgba(239,68,68,.1)';this.style.color='#f87171'"
                  onmouseleave="this.style.background='none';this.style.color=''">
            <span class="flex-shrink-0 flex items-center justify-center" style="width:18px;height:18px">
              <lucide-angular [img]="icons.LogOut" size="16"></lucide-angular>
            </span>
            <span *ngIf="!isCollapsed()" class="text-[13px] font-semibold whitespace-nowrap">Déconnexion</span>
            <div *ngIf="isCollapsed()"
                 class="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                 style="left:calc(100% + 10px);top:50%;transform:translateY(-50%);
                        background:#1e293b;color:#f87171;font-size:12px;font-weight:600;
                        padding:5px 12px;border-radius:8px;white-space:nowrap;
                        border:1px solid rgba(239,68,68,.2);box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:99">
              Déconnexion
            </div>
          </button>

          <!-- Collapse toggle (desktop only) -->
          <button (click)="toggleSidebar()"
                  class="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 transition-all duration-150 cursor-pointer mt-0.5"
                  style="background:none;border:none"
                  onmouseenter="this.style.background='rgba(255,255,255,.05)';this.style.color='#9ca3af'"
                  onmouseleave="this.style.background='none';this.style.color=''">
            <span class="flex-shrink-0 flex items-center justify-center" style="width:18px;height:18px">
              <lucide-angular [img]="isCollapsed() ? icons.ChevronRight : icons.ChevronLeft" size="16"></lucide-angular>
            </span>
            <span *ngIf="!isCollapsed()" class="text-[13px] font-semibold whitespace-nowrap">Réduire</span>
          </button>
        </div>
      </aside>

      <!-- ══════════════════════════════
           MAIN AREA
      ══════════════════════════════ -->
      <div class="flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out" style="height:100vh"
           [ngClass]="mainMarginClass()">

        <!-- ── Topbar ── -->
        <header class="flex-shrink-0 flex items-center justify-between px-6 lg:px-8 h-14 sm:h-16"
                style="background:rgba(255,255,255,.96);backdrop-filter:blur(12px);
                       border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:10">

          <!-- Left -->
          <div class="flex items-center gap-3">
            <!-- Mobile hamburger -->
            <button (click)="toggleMobile()"
                    class="lg:hidden flex items-center justify-center rounded-xl text-gray-500 transition-all active:scale-95"
                    style="width:36px;height:36px;border:none;background:none;cursor:pointer"
                    onmouseenter="this.style.background='#f1f5f9'"
                    onmouseleave="this.style.background='none'">
              <lucide-angular [img]="isMobileOpen() ? icons.X : icons.Menu" size="18"></lucide-angular>
            </button>

            <div>
              <p class="hidden sm:block font-black uppercase text-gray-400"
                 style="font-size:9px;letter-spacing:.2em;line-height:1">Console Admin</p>
              <h1 class="font-black text-gray-900 leading-tight tracking-tight"
                  style="font-size:15px;line-height:1.2">{{ currentPageTitle() }}</h1>
            </div>
          </div>

          <!-- Right -->
          <div class="flex items-center gap-2" *ngIf="user$ | async as user">

            <!-- Bell -->
            <button class="relative flex items-center justify-center rounded-xl text-gray-500 transition-all active:scale-95"
                    style="width:36px;height:36px;border:none;background:none;cursor:pointer"
                    onmouseenter="this.style.background='#f1f5f9'"
                    onmouseleave="this.style.background='none'">
              <lucide-angular [img]="icons.Bell" size="16"></lucide-angular>
              <span class="absolute rounded-full bg-emerald-500"
                    style="width:6px;height:6px;top:8px;right:8px"></span>
            </button>

            <!-- User chip -->
            <div class="flex items-center gap-2.5 pl-3 ml-1"
                 style="border-left:1px solid #e2e8f0">
              <div class="flex items-center justify-center rounded-xl font-black text-xs text-emerald-700"
                   style="width:32px;height:32px;background:#d1fae5;flex-shrink:0">
                {{ (user.prenom.charAt(0) || 'A').toUpperCase() }}{{ user.nom.charAt(0).toUpperCase() }}
              </div>
              <div class="hidden sm:block leading-none">
                <p class="font-black text-gray-900" style="font-size:13px">
                  {{ user.prenom }} {{ user.nom }}
                </p>
                <p class="font-black text-emerald-600 uppercase mt-0.5"
                   style="font-size:9px;letter-spacing:.12em">{{ user.role }}</p>
              </div>
            </div>
          </div>
        </header>

        <!-- ── Page content ── -->
        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `,
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  isMobileOpen = signal(false);
  currentPageTitle = signal('Tableau de bord');

  user$ = this.authService.currentUser$;

  icons = { ChevronLeft, ChevronRight, Menu, LogOut, Bell, X };

  private readonly pageMap: Record<string, string> = {
    '/admin': 'Tableau de bord',
    '/admin/users': 'Utilisateurs',
    '/admin/ads': 'Annonces',
    '/admin/garages': 'Garages',
    '/admin/transactions': 'Transactions',
    '/admin/certifications': 'Certifications',
    '/admin/trade-in': 'Reprises',
    '/admin/avis': 'Avis & Modération',
    '/admin/broadcast': 'Diffusion',
    '/admin/profile': 'Mon Profil',
    '/admin/notifications': 'Notifications',
  };

  navGroups: NavGroup[] = [
    {
      title: "Vue d'ensemble",
      items: [{ label: 'Tableau de bord', route: '/admin', icon: LayoutDashboard, exact: true }],
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Utilisateurs', route: '/admin/users', icon: Users },
        { label: 'Annonces', route: '/admin/ads', icon: Car },
        { label: 'Garages', route: '/admin/garages', icon: Building2 },
      ],
    },
    {
      title: 'Finances',
      items: [{ label: 'Transactions', route: '/admin/transactions', icon: CreditCard }],
    },
    {
      title: 'Opérations',
      items: [
        { label: 'Certifications', route: '/admin/certifications', icon: Shield },
        { label: 'Reprises', route: '/admin/trade-in', icon: Repeat },
        { label: 'Avis & Modération', route: '/admin/avis', icon: MessageSquare },
      ],
    },
    {
      title: 'Communication',
      items: [{ label: 'Diffusion', route: '/admin/broadcast', icon: Megaphone }],
    },
    {
      title: 'Mon Compte',
      items: [
        { label: 'Mon Profil', route: '/admin/profile', icon: UserCircle },
        { label: 'Notifications', route: '/admin/notifications', icon: Bell },
      ],
    },
  ];

  private routerSub?: Subscription;

  ngOnInit() {
    this.updatePageTitle(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.updatePageTitle(e.urlAfterRedirects as string);
        this.isMobileOpen.set(false);
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  /* ── CSS helpers ── */
  sidebarWidthClass(): string {
    return this.isCollapsed() ? 'w-16' : 'w-60';
  }

  sidebarTransformClass(): string {
    return this.isMobileOpen()
      ? 'translate-x-0'
      : '-translate-x-full lg:translate-x-0';
  }

  mainMarginClass(): string {
    return this.isCollapsed() ? 'lg:ml-16' : 'lg:ml-60';
  }

  /* ── Handlers ── */
  updatePageTitle(url: string) {
    const path = url.split('?')[0];
    this.currentPageTitle.set(this.pageMap[path] ?? 'Administration');
  }

  toggleSidebar() {
    this.isCollapsed.update((v) => !v);
  }

  toggleMobile() {
    this.isMobileOpen.update((v) => !v);
  }

  closeMobile() {
    this.isMobileOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
