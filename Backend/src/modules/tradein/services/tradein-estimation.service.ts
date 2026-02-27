import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { toNullableNumber } from '../../../common/utils/number.util';
import type { EstimationResponseDto } from '../dto/estimation-response.dto';
import { ETAT_VEHICULE_VALUES } from '../types/tradein.types';

type EstimationVehicule = {
  id: string;
  anneeFabrication: number | null;
  prixVente: unknown;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
};

@Injectable()
export class TradeInEstimationService {
  normalizeEtatVehicule(value: string): string {
    return value?.trim().toLowerCase() ?? '';
  }

  assertEtatVehiculeValid(etatVehicule: string): void {
    if (!ETAT_VEHICULE_VALUES.includes(etatVehicule as (typeof ETAT_VEHICULE_VALUES)[number])) {
      throw new DomainException('État véhicule invalide', 400, 'TRADEIN_INVALID_ETAT_VEHICULE');
    }
  }

  calculateEstimation(
    vehicule: EstimationVehicule,
    kilometrage: number,
    etatVehicule: string,
  ): EstimationResponseDto {
    const prixBase = toNullableNumber(vehicule.prixVente) ?? 0;
    const km = kilometrage ?? 0;
    const currentYear = new Date().getFullYear();
    const anneeVehicule = vehicule.anneeFabrication ?? currentYear;

    const coeffEtat = this.getCoefficientEtat(etatVehicule);
    const depreciationKm = km * 0.0001;
    const ageVehicule = currentYear - anneeVehicule;
    const depreciationAge = Math.min(ageVehicule * 0.1, 0.7);

    const coeffTotal = coeffEtat * (1 - depreciationKm) * (1 - depreciationAge);
    const prixEstime = this.round2(prixBase * coeffTotal);
    const prixMinimum = this.round2(prixEstime * 0.85);
    const prixMaximum = this.round2(prixEstime * 1.15);

    const scoreCondition = this.round2(coeffTotal * 100);
    const vehiculeDescription = `${vehicule.marque?.nom ?? ''} ${vehicule.modele?.nom ?? ''}`.trim() || 'Vehicule';

    return {
      vehiculeId: vehicule.id,
      vehiculeDescription,
      prixEstime,
      prixMinimum,
      prixMaximum,
      kilometrage: km,
      etatVehicule,
      scoreCondition,
      recommandation: this.getRecommandation(scoreCondition),
    };
  }

  private getCoefficientEtat(etatVehicule: string): number {
    const normalized = etatVehicule.toLowerCase();
    if (normalized === 'excellent') return 1.0;
    if (normalized === 'bon') return 0.85;
    if (normalized === 'moyen') return 0.7;
    if (normalized === 'mauvais') return 0.5;
    return 0.7;
  }

  private getRecommandation(scoreCondition: number): string {
    if (scoreCondition >= 80) return 'Excellent etat - Vehicule hautement souhaitable';
    if (scoreCondition >= 60) return 'Bon etat - Vehicule interessante';
    if (scoreCondition >= 40) return 'Etat moyen - Negociation possible';
    return 'Etat preoccupant - Revision necessaire';
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
