import { Injectable } from '@nestjs/common';

import {
  ROLE_ADMIN,
  ROLE_PROFESSIONNEL,
  ROLES_ADMIN_SUPER_ADMIN,
  ROLES_VEHICULE_CREATOR,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { assertHasAnyRole } from '../../../common/utils/authorization.util';
import { hasAnyRole, isOwnerOrHasAnyRole } from '../../../common/utils/role.util';
import { AnnonceRecord, ReservationRecord } from '../location.models';

const ROLES_CAN_CREATE_ANNONCE = [ROLE_PROFESSIONNEL, ...ROLES_VEHICULE_CREATOR, ROLE_ADMIN] as const;

@Injectable()
export class LocationAccessPolicy {
  assertCanCreateAnnonce(role: string | undefined | null): void {
    assertHasAnyRole(role, ROLES_CAN_CREATE_ANNONCE);
  }

  assertAnnonceOwnerOrAdmin(annonce: AnnonceRecord, userId: string, role: string | undefined | null): void {
    if (!isOwnerOrHasAnyRole(userId, annonce.proprietaire_id, role, ROLES_ADMIN_SUPER_ADMIN)) {
      throw new DomainException('Accès refusé à cette annonce', 403, 'ACCESS_DENIED_ANNONCE');
    }
  }

  assertReservationPartyOrAdmin(
    reservation: ReservationRecord,
    userId: string,
    role: string | undefined | null,
  ): void {
    if (hasAnyRole(role, ROLES_ADMIN_SUPER_ADMIN)) {
      return;
    }

    const ownerId = reservation.annonce_location.proprietaire_id;
    const locataireId = reservation.locataire_id;

    if (ownerId !== userId && locataireId !== userId) {
      throw new DomainException('Accès refusé à cette réservation', 403, 'ACCESS_DENIED_RESERVATION');
    }
  }
}
