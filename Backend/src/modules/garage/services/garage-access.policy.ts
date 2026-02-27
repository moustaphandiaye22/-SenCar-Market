import { Injectable } from '@nestjs/common';

import { ROLES_ADMIN_MODERATION } from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { hasAnyRole } from '../../../common/utils/role.util';
import { GarageRecord } from '../garage.models';

@Injectable()
export class GarageAccessPolicy {
  assertHasAnyRole(currentRole: string | null | undefined, allowedRoles: readonly string[]): void {
    if (!hasAnyRole(currentRole, allowedRoles)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  assertAdmin(currentRole: string | null | undefined): void {
    this.assertHasAnyRole(currentRole, ROLES_ADMIN_MODERATION);
  }

  assertOwnerOrAdmin(currentUserId: string, role: string | null | undefined, ownerId: string): void {
    if (currentUserId === ownerId) {
      return;
    }
    this.assertAdmin(role);
  }

  assertGarageOwnerOrAdmin(
    garage: GarageRecord,
    currentUserId: string,
    role: string | null | undefined,
  ): void {
    if (garage.utilisateurId && garage.utilisateurId === currentUserId) {
      return;
    }
    this.assertAdmin(role);
  }
}
