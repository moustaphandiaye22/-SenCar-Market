import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { STATUT_DEMANDE_CERTIFICATION_VALUES, StatutDemandeCertification } from '../types/certification.types';

@Injectable()
export class CertificationStatusValidator {
  parseStatus(rawStatus: string): StatutDemandeCertification {
    const normalized = rawStatus?.toUpperCase();
    if (!STATUT_DEMANDE_CERTIFICATION_VALUES.includes(normalized as StatutDemandeCertification)) {
      throw new DomainException('Statut de demande certification invalide', 400, 'CERTIFICATION_STATUS_INVALID');
    }
    return normalized as StatutDemandeCertification;
  }
}
