import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { STATUT_ABONNEMENT_VALUES, StatutAbonnement } from '../types/abonnement.types';

@Injectable()
export class AbonnementInputValidator {
  parseBoostDates(dateDebutIso: string, dateFinIso: string): [Date, Date] {
    const dateDebut = new Date(dateDebutIso);
    const dateFin = new Date(dateFinIso);
    if (Number.isNaN(dateDebut.getTime()) || Number.isNaN(dateFin.getTime()) || dateDebut >= dateFin) {
      throw new DomainException('Dates de boost invalides', 400, 'BOOST_INVALID_DATES');
    }
    return [dateDebut, dateFin];
  }

  parseStatutOrDefault(raw: string): StatutAbonnement {
    if (!STATUT_ABONNEMENT_VALUES.includes(raw as StatutAbonnement)) {
      return 'EN_ATTENTE';
    }
    return raw as StatutAbonnement;
  }
}
