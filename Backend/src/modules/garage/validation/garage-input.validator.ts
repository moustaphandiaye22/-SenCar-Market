import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { STATUT_VALIDATION_GARAGE_VALUES, StatutValidationGarage } from '../types/garage.types';

@Injectable()
export class GarageInputValidator {
  validateStatutTransition(current: StatutValidationGarage | null, next: StatutValidationGarage): void {
    if (!STATUT_VALIDATION_GARAGE_VALUES.includes(next)) {
      throw new DomainException('Statut de garage invalide', 400, 'GARAGE_STATUS_INVALID');
    }

    if (current === 'ACTIF' && next !== 'SUSPENDU') {
      throw new DomainException(
        'Un garage actif ne peut passer que vers SUSPENDU',
        400,
        'GARAGE_STATUS_ACTIVE_ONLY_SUSPEND',
      );
    }

    if ((current === 'REJET' || current === 'SUSPENDU') && next !== 'ACTIF') {
      throw new DomainException(
        'Un garage rejeté/suspendu ne peut passer que vers ACTIF',
        400,
        'GARAGE_STATUS_REJECTED_SUSPENDED_ONLY_REACTIVATE',
      );
    }
  }

  validateProximityInputs(latitude: number, longitude: number, rayonKm: number): void {
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new DomainException('Latitude invalide', 400, 'GARAGE_INVALID_LATITUDE');
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new DomainException('Longitude invalide', 400, 'GARAGE_INVALID_LONGITUDE');
    }
    if (!Number.isFinite(rayonKm) || rayonKm <= 0 || rayonKm > 200) {
      throw new DomainException('Rayon de recherche invalide', 400, 'GARAGE_INVALID_RADIUS');
    }
  }
}
