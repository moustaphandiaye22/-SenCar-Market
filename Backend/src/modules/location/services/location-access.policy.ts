import { Injectable } from '@nestjs/common';

import {
  ROLE_ADMIN,
  ROLE_PROPRIETAIRE_LOUEUR,
  ROLES_ADMIN_SUPER_ADMIN,
  ROLES_VEHICULE_CREATOR,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { assertHasAnyRole } from '../../../common/utils/authorization.util';
import { hasAnyRole, isOwnerOrHasAnyRole } from '../../../common/utils/role.util';
import { AnnonceRecord, ReservationRecord } from '../location.models';

const ROLES_CAN_CREATE_ANNONCE = [ROLE_PROPRIETAIRE_LOUEUR, ...ROLES_VEHICULE_CREATOR, ROLE_ADMIN] as const;

@Injectable()
export class LocationAccessPolicy {
  assertCanCreateAnnonce(role: string | undefined | null): void {
    assertHasAnyRole(role, ROLES_CAN_CREATE_ANNONCE);
  }

  assertAnnonceOwnerOrAdmin(annonce: AnnonceRecord, userId: string, role: string | undefined | null): void {
    if (!isOwnerOrHasAnyRole(userId, annonce.proprietaireId, role, ROLES_ADMIN_SUPER_ADMIN)) {
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

    const ownerId = reservation.annonceLocation.proprietaireId;
    const locataireId = reservation.locataireId;

    if (ownerId !== userId && locataireId !== userId) {
      throw new DomainException('Accès refusé à cette réservation', 403, 'ACCESS_DENIED_RESERVATION');
    }
  }
}
