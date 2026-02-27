import { Injectable } from '@nestjs/common';

import { ROLES_ADMIN_MODERATION } from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { hasAnyRole } from '../../../common/utils/role.util';
import type { UserRecord } from '../certification.models';

@Injectable()
export class CertificationSecurityService {
  ensureOwnerOrAdmin(current: UserRecord, ownerId: string): void {
    if (current.id === ownerId) {
      return;
    }
    this.ensureRole(current.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION);
  }

  ensureRole(role: string | null | undefined, allowed: readonly string[]): void {
    if (!hasAnyRole(role, allowed)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  ensureInspectionAccess(current: UserRecord, inspecteurId: string): void {
    if (hasAnyRole(current.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION) || current.id === inspecteurId) {
      return;
    }
    throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
  }
}
