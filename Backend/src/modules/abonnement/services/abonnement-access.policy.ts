import { Injectable } from '@nestjs/common';

import {
  ROLE_ADMIN,
  ROLES_ADMIN_SUPER_ADMIN,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { hasAnyRole } from '../../../common/utils/role.util';
import type { UserRecord } from '../abonnement.models';

@Injectable()
export class AbonnementAccessPolicy {
  assertAdmin(role: string | undefined | null): void {
    if (role !== ROLE_ADMIN) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  assertOwnerOrAdmin(currentUser: UserRecord, ownerId: string): void {
    const role = currentUser.typeUtilisateur?.nom;
    if (currentUser.id === ownerId || hasAnyRole(role, ROLES_ADMIN_SUPER_ADMIN)) {
      return;
    }

    throw new DomainException('Accès refusé', 403, 'ACCESS_DENIED_RESOURCE');
  }

  assertCanManageBoost(role: string | undefined | null): void {
    if (!hasAnyRole(role, ROLES_ADMIN_SUPER_ADMIN)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }
}
