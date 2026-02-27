import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { STATUT_TRADEIN_VALUES, StatutTradeIn } from '../types/tradein.types';

@Injectable()
export class TradeInStatusValidator {
  parseStatus(rawStatus: string): StatutTradeIn {
    const normalized = rawStatus?.toUpperCase();
    if (!STATUT_TRADEIN_VALUES.includes(normalized as StatutTradeIn)) {
      throw new DomainException('Statut trade-in invalide', 400, 'TRADEIN_STATUS_INVALID');
    }
    return normalized as StatutTradeIn;
  }
}
