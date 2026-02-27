import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class PaiementAmountValidator {
  parseNonNegativeAmount(raw: string | undefined, message: string, code: string): number {
    const value = raw ? Number(raw) : 0;
    if (!Number.isFinite(value) || value < 0) {
      throw new DomainException(message, 400, code);
    }
    return value;
  }
}
