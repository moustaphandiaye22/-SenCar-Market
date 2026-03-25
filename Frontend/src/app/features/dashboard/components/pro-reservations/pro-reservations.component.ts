import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalService } from '../../../rentals/services/rental.service';
import { AnnonceLocation, ReservationLocation } from '../../../rentals/models/rental.model';
import { LucideAngularModule, Calendar, Check, X, Car, Clock } from 'lucide-angular';
import { forkJoin, switchMap, of, map } from 'rxjs';

@Component({
  selector: 'app-pro-reservations',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pro-reservations.component.html'
})
export class ProReservationsComponent implements OnInit {
  private rentalService = inject(RentalService);
  reservations: ReservationLocation[] = [];
  mesAnnonces: AnnonceLocation[] = [];
  isLoading = true;

  icons = { Calendar, Check, X, Car, Clock };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.rentalService.getMesAnnonces().pipe(
      switchMap((annonces: AnnonceLocation[]) => {
        this.mesAnnonces = annonces;
        if (annonces.length === 0) return of([] as ReservationLocation[][]);
        const requests = annonces.map(a => this.rentalService.getReservationsByAnnonce(a.id));
        return forkJoin(requests);
      }),
      map((responses: ReservationLocation[][]) =>
        responses.flat().sort((a, b) =>
          new Date(b.dateCreation ?? '').getTime() - new Date(a.dateCreation ?? '').getTime()
        )
      )
    ).subscribe({
      next: (allReservations: ReservationLocation[]) => {
        this.reservations = allReservations;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  getAnnonce(id: string): AnnonceLocation | undefined {
    return this.mesAnnonces.find(a => a.id === id);
  }

  updateStatut(id: string, statut: string) {
    this.rentalService.updateStatutReservation(id, statut).subscribe(() => this.loadData());
  }
}
