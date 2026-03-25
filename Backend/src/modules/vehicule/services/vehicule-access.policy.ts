import { Injectable } from '@nestjs/common';

import {
  ROLES_ADMIN_SUPER_ADMIN,
  ROLES_VEHICULE_CREATOR,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { assertHasAnyRole } from '../../../common/utils/authorization.util';
import { isOwnerOrHasAnyRole } from '../../../common/utils/role.util';
import type { VehiculeRecord } from '../vehicule.models';

@Injectable()
export class VehiculeAccessPolicy {
  assertCanCreate(role: string | undefined | null): void {
    assertHasAnyRole(role, ROLES_VEHICULE_CREATOR);
  }

  assertAdminOrOwner(role: string | undefined | null, currentUserId: string, ownerId: string): void {
    if (!isOwnerOrHasAnyRole(currentUserId, ownerId, role, ROLES_ADMIN_SUPER_ADMIN)) {
      throw new DomainException('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  assertCanReadVehicule(
    vehicule: VehiculeRecord,
    currentUserId: string,
    role: string | undefined | null,
  ): void {
    if (vehicule.statut === 'PUBLIE') {
      return;
    }
    this.assertAdminOrOwner(role, currentUserId, vehicule.proprietaire_id);
  }
}
