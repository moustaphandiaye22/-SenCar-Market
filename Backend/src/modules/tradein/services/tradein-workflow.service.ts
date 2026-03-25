import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import type { StatutTradeIn } from '../types/tradein.types';

@Injectable()
export class TradeInWorkflowService {
  // Map frontend status aliases to backend statuses
  private readonly statusAliases: Record<string, StatutTradeIn> = {
    'EN_ANALYSE': 'EN_COURS_EVALUATION',
    'REFUSE': 'REJETEE',
  };

  private normalizeStatus(statut: StatutTradeIn): StatutTradeIn {
    return this.statusAliases[statut] || statut;
  }

  validateTransition(current: StatutTradeIn, next: StatutTradeIn): void {
    const normalizedCurrent = this.normalizeStatus(current);
    const normalizedNext = this.normalizeStatus(next);

    if (normalizedCurrent === 'EN_ATTENTE') {
      if (!['EN_COURS_EVALUATION', 'REJETEE', 'ANNULEE'].includes(normalizedNext)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (normalizedCurrent === 'EN_COURS_EVALUATION') {
      if (!['EVALUATION_TERMINEE', 'REJETEE'].includes(normalizedNext)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (normalizedCurrent === 'EVALUATION_TERMINEE') {
      if (!['OFFRE_PROPOSEE', 'ACCEPTE', 'REJETEE'].includes(normalizedNext)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (normalizedCurrent === 'OFFRE_PROPOSEE') {
      if (!['ACCEPTE', 'REJETEE'].includes(normalizedNext)) {
        throw new DomainException(`Transition invalide de ${current} vers ${next}`, 400, 'TRADEIN_STATUS_TRANSITION_INVALID');
      }
      return;
    }

    if (['ACCEPTE', 'REJETEE', 'ANNULEE'].includes(normalizedCurrent)) {
      throw new DomainException(`Impossible de modifier une demande au statut final ${current}`, 400, 'TRADEIN_CANNOT_MODIFY_FINAL');
    }
  }
}
