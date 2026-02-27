import { Injectable } from '@nestjs/common';

import { ROLES_ADMIN_MODERATION } from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { hasAnyRole } from '../../../common/utils/role.util';
import type { UserRecord } from '../tradein.models';

@Injectable()
export class TradeInSecurityService {
  ensureAdminOrModerator(role: string | null | undefined): void {
    if (!hasAnyRole(role, ROLES_ADMIN_MODERATION)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  ensureOwnerOrAdmin(current: UserRecord, ownerId: string): void {
    if (current.id === ownerId) {
      return;
    }
    this.ensureAdminOrModerator(current.typeUtilisateur?.nom);
  }
}
