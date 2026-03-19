import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { OptionRecord } from '../assurance.models';

@Injectable()
export class AssurancePricingService {
  calculateTotalPrice(prixBase: number, options: OptionRecord[]): number {
    return options.reduce((sum, option) => sum + (toNullableNumber(option.prix_supplementaire) ?? 0), prixBase);
  }

  resolveDateFin(dateDebut: Date, dureeMois: number | null): Date {
    const dateFin = new Date(dateDebut.getTime());
    if (dureeMois) {
      dateFin.setMonth(dateFin.getMonth() + dureeMois);
      return dateFin;
    }

    dateFin.setFullYear(dateFin.getFullYear() + 1);
    return dateFin;
  }

  generateContractNumber(date: Date): string {
    return `ASC-${date.getTime()}`;
  }

  buildContractUrl(numeroContrat: string | null): string {
    return `/contracts/${numeroContrat ?? this.generateContractNumber(new Date())}.pdf`;
  }
}
