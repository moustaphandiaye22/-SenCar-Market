import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';

const VALID_RESERVATION_STATUSES = ['ACTIF', 'INACTIF', 'EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE', 'EN_COURS'];

@Injectable()
export class LocationInputValidator {
  parseReservationDates(dateDebutIso: string, dateFinIso: string): { dateDebut: Date; dateFin: Date } {
    const dateDebut = new Date(dateDebutIso);
    const dateFin = new Date(dateFinIso);

    if (Number.isNaN(dateDebut.getTime()) || Number.isNaN(dateFin.getTime())) {
      throw new DomainException('Dates invalides', 400, 'RESERVATION_INVALID_DATE');
    }
    if (dateDebut > dateFin) {
      throw new DomainException('La date de début doit précéder la date de fin', 400, 'RESERVATION_INVALID_DATE_ORDER');
    }
    if (dateDebut < new Date()) {
      throw new DomainException('La date de début ne peut pas être dans le passé', 400, 'RESERVATION_START_DATE_PAST');
    }

    return { dateDebut, dateFin };
  }

  parseReservationStatus(statut: string): string {
    const normalized = statut?.toUpperCase().trim();
    if (!normalized || !VALID_RESERVATION_STATUSES.includes(normalized)) {
      throw new DomainException('Statut de réservation invalide', 400, 'INVALID_RESERVATION_STATUS');
    }

    return normalized;
  }

  parseDisponibiliteDate(date: string): Date {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new DomainException('Date de disponibilité invalide', 400, 'DISPONIBILITE_INVALID_DATE');
    }
    return parsedDate;
  }
}
