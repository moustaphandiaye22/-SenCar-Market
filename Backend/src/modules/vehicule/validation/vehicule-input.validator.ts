import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class VehiculeInputValidator {
  resolveSortBy(sortBy: string): 'createdAt' | 'prixVente' | 'anneeFabrication' | 'vues' {
    if (sortBy === 'prixVente' || sortBy === 'anneeFabrication' || sortBy === 'vues') {
      return sortBy;
    }
    return 'createdAt';
  }

  parseSortDir(sortDir: string): 'asc' | 'desc' {
    return sortDir.toLowerCase() === 'asc' ? 'asc' : 'desc';
  }

  parseBoostDates(debutIso: string, finIso: string): { debut: Date; fin: Date } {
    const debut = new Date(debutIso);
    const fin = new Date(finIso);
    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || debut >= fin) {
      throw new DomainException('Dates de boost invalides', 400, 'BOOST_INVALID_DATES');
    }
    return { debut, fin };
  }

  normalizePhotosUrls(values?: string[]): string[] {
    if (!values || values.length === 0) {
      return [];
    }
    const normalized = values.map((value) => value.trim());
    if (normalized.some((value) => !value)) {
      throw new DomainException('Une URL de photo est invalide', 400, 'VEHICULE_INVALID_PHOTO_URL');
    }
    return normalized;
  }
}
