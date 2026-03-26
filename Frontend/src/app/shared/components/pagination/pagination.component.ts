import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      *ngIf="totalItems > pageSize"
      class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-8 py-4 border-t border-gray-100"
    >
      <p class="text-xs text-gray-400 font-bold">
        Affichage
        <span class="text-gray-700">{{ rangeStart }}–{{ rangeEnd }}</span>
        sur
        <span class="text-gray-700">{{ totalItems }}</span>
        résultats
      </p>
      <div class="flex items-center gap-1">
        <button
          (click)="changePage(currentPage - 1)"
          [disabled]="currentPage === 0"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500
                 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <lucide-angular [img]="icons.ChevronLeft" size="16"></lucide-angular>
        </button>

        <ng-container *ngFor="let p of visiblePages">
          <span
            *ngIf="p === ELLIPSIS"
            class="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
          >
            …
          </span>
          <button
            *ngIf="p !== ELLIPSIS"
            (click)="changePage(p)"
            class="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all"
            [class]="
              p === currentPage
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            {{ p + 1 }}
          </button>
        </ng-container>

        <button
          (click)="changePage(currentPage + 1)"
          [disabled]="currentPage === lastPage"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500
                 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <lucide-angular [img]="icons.ChevronRight" size="16"></lucide-angular>
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Output() pageChange = new EventEmitter<number>();

  readonly ELLIPSIS = -1;
  readonly icons = { ChevronLeft, ChevronRight };

  visiblePages: number[] = [];

  get lastPage(): number {
    return Math.max(0, Math.ceil(this.totalItems / this.pageSize) - 1);
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  constructor() {
    this.buildVisiblePages();
  }

  ngOnChanges(): void {
    this.buildVisiblePages();
  }

  buildVisiblePages(): void {
    const total = this.lastPage + 1;
    if (total <= 7) {
      this.visiblePages = Array.from({ length: total }, (_, i) => i);
      return;
    }

    const pages: number[] = [0];

    if (this.currentPage > 2) {
      pages.push(this.ELLIPSIS);
    }

    const start = Math.max(1, this.currentPage - 1);
    const end = Math.min(this.lastPage - 1, this.currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.lastPage - 2) {
      pages.push(this.ELLIPSIS);
    }

    pages.push(this.lastPage);
    this.visiblePages = pages;
  }

  changePage(page: number): void {
    if (page < 0 || page > this.lastPage || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
