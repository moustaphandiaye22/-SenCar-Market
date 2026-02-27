import { Injectable } from '@nestjs/common';

import { ROLES_STRICT_ADMIN } from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { assertHasAnyRole } from '../../../common/utils/authorization.util';
import { AdminUserRecord } from '../admin.models';

@Injectable()
export class AdminAccessPolicy {
  assertAdmin(currentUser: AdminUserRecord | null): void {
    if (!currentUser) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_STRICT_ADMIN);
  }
}
