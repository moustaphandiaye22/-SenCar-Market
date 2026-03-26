import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  LucideAngularModule,
  CreditCard,
  RotateCcw,
  Search,
  Filter,
} from 'lucide-angular';
import { PromptService } from '../../../../core/services/prompt.service';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-manage-transactions',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    PaginationComponent,
  ],
  template: `
    <div class="p-6 lg:p-8 relative overflow-hidden">
      <!-- Decorative background -->
      <div
        class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -z-10"
      ></div>

      <div class="mb-10">
        <div
          class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h2 class="text-4xl font-black text-gray-900 tracking-tight">
              Finances
            </h2>
            <p class="text-gray-500 mt-2 font-medium">
              Flux financiers et commissions de la plateforme.
            </p>
          </div>

          <div
            class="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto"
          >
            <div class="relative w-full md:w-80">
              <lucide-angular
                [img]="icons.Search"
                size="18"
                class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              ></lucide-angular>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="filterTransactions()"
                placeholder="Rechercher une transaction..."
                class="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none shadow-sm transition-all duration-300"
              />
            </div>

            <div
              class="bg-gray-900 px-8 py-5 rounded-2xl text-white shadow-xl relative overflow-hidden group w-full md:w-auto"
            >
              <div
                class="absolute inset-0 bg-primary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
              ></div>
              <p
                class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-1 relative z-10"
              >
                Commissions Totales
              </p>
              <p class="text-2xl font-black tracking-tight relative z-10">
                {{ totalCommissions | number }}
                <span class="text-xs opacity-50">FCFA</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/30 border-b border-gray-100">
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center"
                >
                  Date
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Bénéficiaire
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Transaction
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right"
                >
                  Montant
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center"
                >
                  État
                </th>
                <th
                  class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                *ngFor="let t of pagedTransactions"
                class="hover:bg-primary-50/10 transition-colors group"
              >
                <td class="px-8 py-6 text-center">
                  <div
                    class="text-[10px] font-black text-gray-900 uppercase tracking-tighter"
                  >
                    {{ t.createdAt | date: 'dd MMM yyyy' }}
                  </div>
                  <div class="text-[10px] font-bold text-gray-400 mt-1">
                    {{ t.createdAt | date: 'HH:mm' }}
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-600 font-black text-xs shadow-inner"
                    >
                      {{ t.utilisateur?.prenom?.[0] || 'U' }}
                    </div>
                    <div>
                      <div
                        class="font-black text-gray-900 text-sm tracking-tight"
                      >
                        {{ t.utilisateur?.prenom }} {{ t.utilisateur?.nom }}
                      </div>
                      <div
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 opacity-60"
                      >
                        {{
                          t.utilisateur?.email ||
                            (t.utilisateurId
                              ? 'ID: ' + t.utilisateurId.substring(0, 8)
                              : 'N/A')
                        }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div
                    class="text-[10px] font-black text-gray-900 uppercase tracking-wide px-2 py-0.5 bg-gray-100 rounded-md inline-block mb-1"
                  >
                    {{ t.typeTransaction }}
                  </div>
                  <div
                    class="text-[10px] font-medium text-gray-400 line-clamp-1 italic max-w-[200px]"
                  >
                    {{ t.description }}
                  </div>
                </td>
                <td
                  class="px-8 py-6 text-right font-black text-gray-900 tracking-tight"
                >
                  {{ t.montant | number }} <span class="text-[10px]">FCFA</span>
                </td>
                <td class="px-8 py-6 text-center">
                  <span
                    class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    [ngClass]="getStatusClass(t.statut)"
                  >
                    {{ t.statut }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <button
                    *ngIf="
                      t.statut === 'CONFIRMEE' ||
                      t.statut === 'COMPLETED' ||
                      t.statut === 'EFFECTUEE'
                    "
                    (click)="rembourser(t)"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-[1rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 shadow-sm shadow-red-100"
                  >
                    <lucide-angular
                      [img]="icons.RotateCcw"
                      size="14"
                    ></lucide-angular>
                    Rembourser
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-pagination
          [totalItems]="totalTransactions"
          [pageSize]="PAGE_SIZE"
          [currentPage]="currentPage"
          (pageChange)="onPageChange($event)"
        >
        </app-pagination>

        <div *ngIf="transactions.length === 0" class="py-32 text-center">
          <div
            class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <lucide-angular
              [img]="icons.Filter"
              size="40"
              class="text-gray-200"
            ></lucide-angular>
          </div>
          <p class="text-gray-400 font-black uppercase tracking-widest">
            Aucun flux financier
          </p>
          <p class="text-gray-300 text-sm mt-2">
            Nous n'avons trouvé aucune transaction correspondant à vos critères.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ManageTransactionsComponent implements OnInit {
  private adminService = inject(AdminService);
  private promptService = inject(PromptService);
  private toastService = inject(ToastService);
  transactions: any[] = [];
  totalTransactions = 0;
  searchQuery = '';
  totalCommissions = 0;
  currentPage = 0;
  readonly PAGE_SIZE = 10;
  icons = { CreditCard, RotateCcw, Search, Filter };

  get pagedTransactions(): any[] {
    return this.transactions;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  ngOnInit() {
    this.loadTransactions();
    this.adminService
      .getTotalCommissions()
      .subscribe((total) => (this.totalCommissions = total));
  }

  loadTransactions() {
    console.log(
      'Loading transactions - page:',
      this.currentPage,
      'size:',
      this.PAGE_SIZE,
    );
    this.adminService
      .getTransactions(this.currentPage, this.PAGE_SIZE)
      .subscribe({
        next: (res: any) => {
          console.log('Transactions API response:', res);
          console.log('Transactions content:', res?.content);
          console.log('Transactions totalElements:', res?.totalElements);
          this.transactions = res?.content || [];
          this.totalTransactions = res?.totalElements || 0;
        },
        error: (err) => console.error('Error loading transactions', err),
      });
  }

  filterTransactions() {
    this.currentPage = 0;
    this.loadTransactions();
  }

  rembourser(t: any) {
    this.promptService.show({
      title: 'Remboursement',
      message: 'Veuillez indiquer la raison de ce remboursement.',
      confirmText: 'Rembourser',
      placeholder: 'Ex: Annulation client, erreur de paiement...',
      onConfirm: (reason) => {
        if (reason) {
          this.adminService
            .effectuerRemboursement(t.id, reason)
            .subscribe(() => {
              this.toastService.success('Transaction remboursée avec succès');
              this.loadTransactions();
            });
        }
      },
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'CONFIRMEE':
      case 'COMPLETED':
      case 'EFFECTUEE':
        return 'bg-green-50 text-green-600';
      case 'PENDING':
      case 'EN_COURS':
      case 'EN_ATTENTE':
        return 'bg-amber-50 text-amber-600';
      case 'FAILED':
      case 'ECHOUEE':
      case 'ANNULEE':
        return 'bg-red-50 text-red-600';
      case 'REFUNDED':
      case 'REMBOURSEE':
      case 'REMBOURSEMENT':
        return 'bg-gray-50 text-gray-500';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  }
}
