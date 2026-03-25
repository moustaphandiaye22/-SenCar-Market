import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { STATUT_TRADEIN_VALUES, StatutTradeIn } from '../types/tradein.types';

@Injectable()
export class TradeInStatusValidator {
  // Map frontend status aliases to backend statuses
  private readonly statusAliases: Record<string, StatutTradeIn> = {
    'EN_ANALYSE': 'EN_COURS_EVALUATION',
    'REFUSE': 'REJETEE',
  };

  parseStatus(rawStatus: string): StatutTradeIn {
    const normalized = rawStatus?.toUpperCase();
    if (!STATUT_TRADEIN_VALUES.includes(normalized as StatutTradeIn)) {
      throw new DomainException('Statut trade-in invalide', 400, 'TRADEIN_STATUS_INVALID');
    }
    // Normalize alias to standard status
    return this.statusAliases[normalized] || normalized as StatutTradeIn;
  }
}
