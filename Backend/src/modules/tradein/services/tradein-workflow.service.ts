import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import type { StatutTradeIn } from '../types/tradein.types';

@Injectable()
export class TradeInWorkflowService {
  validateTransition(current: StatutTradeIn, next: StatutTradeIn): void {
    if (current === 'EN_ATTENTE') {
      if (!['EN_COURS_EVALUATION', 'REJETEE', 'ANNULEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (current === 'EN_COURS_EVALUATION') {
      if (!['EVALUATION_TERMINEE', 'REJETEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (current === 'EVALUATION_TERMINEE') {
      if (!['ACCEPTE', 'REJETEE'].includes(next)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (['ACCEPTE', 'REJETEE', 'ANNULEE'].includes(current)) {
      throw new DomainException(`Impossible de modifier une demande au statut final ${current}`, 400, 'TRADEIN_CANNOT_MODIFY_FINAL');
    }
  }
}
