import { Injectable } from '@nestjs/common';

import {
  ROLES_ADMIN_MODERATION,
  ROLES_ASSURANCE_MANAGER,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { hasAnyRole } from '../../../common/utils/role.util';
import type { UserRecord } from '../assurance.models';

@Injectable()
export class AssuranceAccessPolicy {
  assertAssuranceManager(currentUser: UserRecord): void {
    if (!hasAnyRole(currentUser.type_utilisateur?.nom, ROLES_ASSURANCE_MANAGER)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  canAccessSouscription(currentUser: UserRecord, ownerId: string): boolean {
    if (currentUser.id === ownerId) {
      return true;
    }

    return hasAnyRole(currentUser.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);
  }

  assertCanAccessSouscription(currentUser: UserRecord, ownerId: string): void {
    if (!this.canAccessSouscription(currentUser, ownerId)) {
      throw new DomainException('Accès refusé à cette souscription', 403, 'FORBIDDEN');
    }
  }
}
