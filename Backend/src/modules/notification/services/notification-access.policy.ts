import { Injectable } from '@nestjs/common';

import { ROLES_ADMIN_MODERATION } from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { hasAnyRole } from '../../../common/utils/role.util';
import type { UserRecord } from '../notification.models';

@Injectable()
export class NotificationAccessPolicy {
  assertOwnerOrAdmin(currentUser: UserRecord, ownerId: string): void {
    const role = currentUser.typeUtilisateur?.nom;
    const isAdmin = hasAnyRole(role, ROLES_ADMIN_MODERATION);
    if (!isAdmin && currentUser.id !== ownerId) {
      throw new DomainException('Accès refusé', 403, 'ACCESS_DENIED_NOTIFICATIONS');
    }
  }

  assertModeratorOrAdmin(role: string | undefined | null): void {
    if (!hasAnyRole(role, ROLES_ADMIN_MODERATION)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }
}
