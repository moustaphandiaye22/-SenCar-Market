import { HTTP_STATUS } from '../constants/http-status-codes';
import { DomainException } from '../exceptions/domain.exception';

import { hasAnyRole } from './role.util';

export function assertHasAnyRole(role: string | null | undefined, allowedRoles: readonly string[]): void {
  if (!hasAnyRole(role, allowedRoles)) {
    throw new DomainException('Accès refusé', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
}
