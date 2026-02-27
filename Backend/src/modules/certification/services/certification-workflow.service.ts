import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import type { StatutDemandeCertification } from '../types/certification.types';

@Injectable()
export class CertificationWorkflowService {
  validateTransition(current: StatutDemandeCertification, next: StatutDemandeCertification): void {
    if (current === 'EN_ATTENTE') {
      if (!['PAYEE', 'REJETEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'CERTIFICATION_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (current === 'PAYEE') {
      if (!['INSPECTION_PROGRAMMEE', 'REJETEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'CERTIFICATION_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (current === 'INSPECTION_PROGRAMMEE') {
      if (!['INSPECTE', 'REJETEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'CERTIFICATION_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (current === 'INSPECTE') {
      if (!['CERTIFIEE', 'REJETEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'CERTIFICATION_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (current === 'CERTIFIEE' || current === 'REJETEE') {
      throw new DomainException('Impossible de modifier un état final', 400, 'CERTIFICATION_CANNOT_MODIFY_FINAL_STATE');
    }
  }
}
