import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ROLES_ADMIN_MODERATION,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { assertHasAnyRole } from '../../../common/utils/authorization.util';
import { toNullableString, toNumberOrZero } from '../../../common/utils/number.util';
import { hasAnyRole } from '../../../common/utils/role.util';
import { requireNonBlank } from '../../../common/utils/text.util';
import { CreatePaiementRequestDto } from '../dto/create-paiement-request.dto';
import { PaiementResponseDto } from '../dto/paiement-response.dto';
import { CreatePaiementInput, PaiementRecord, UserRecord } from '../paiement.models';
import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';
import { StatutPaiement, STATUT_PAIEMENT_VALUES } from '../types/paiement.types';

import { PaiementEscrowService } from './paiement-escrow.service';
import { PaiementLogService } from './paiement-log.service';

/**
 * Core Payment Service - Single Responsibility for payment CRUD operations
 * Following SRP - only handles payment lifecycle management
 */
@Injectable()
export class PaiementCoreService {
  private readonly commissionRate: number;

  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly configService: ConfigService,
    private readonly escrowService: PaiementEscrowService,
    private readonly paiementLogService: PaiementLogService,
  ) {
    this.commissionRate = Number(this.configService.get<string>('PAIEMENTS_COMMISSION_TAUX', '0.05'));
  }

  /**
   * Create a new payment
   */
  async createPaiement(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const utilisateurId = this.resolveTargetUtilisateurId(request.utilisateurId, currentUser);
    const targetUser = await this.mustFindUser(utilisateurId);

    // Validate reservation only if provided (optional for wallet recharge)
    let reservation: { id: string } | null = null;
    if (request.reservationId) {
      reservation = await this.repository.findReservationById(request.reservationId);
      if (!reservation) {
        throw new DomainException('Réservation non trouvée', 404, 'RESERVATION_NOT_FOUND');
      }
    }

    const is_escrow = Boolean(request.isEscrow);
    const commission = is_escrow ? this.calculateCommission(request.montant) : 0;
    const montant_escrow = is_escrow ? request.montant - commission : request.montant;

    const paiementInput: CreatePaiementInput = {
      id: this.repository.newId(),
      utilisateur_id: targetUser.id,
      ...(reservation ? { reservation_id: reservation.id } : {}),
      montant: request.montant,
      montant_escrow,
      commission,
      methode_paiement: request.methodePaiement,
      statut: 'EN_ATTENTE',
      is_escrow,
      reference_transaction: this.repository.newId(),
    };
    const created = await this.repository.createPaiement(paiementInput);

    await this.paiementLogService.createLogAction(created.id, 'CREATION', 'Paiement créé');
    return this.toPaiementResponse(created);
  }

  /**
   * Get payment by ID with authorization check
   */
  async getPaiementById(id: string, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateur_id);
    return this.toPaiementResponse(paiement);
  }

  /**
   * Get all payments for a user
   */
  async getPaiementsByUtilisateur(
    utilisateurId: string,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.assertOwnerOrAdmin(currentUser, utilisateurId);

    const paiements = await this.repository.findPaiementsByUtilisateurId(utilisateurId);
    return paiements.map((item) => this.toPaiementResponse(item));
  }

  /**
   * Get payments by reservation (admin only)
   */
  async getPaiementsByReservation(
    reservationId: string,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const paiements = await this.repository.findPaiementsByReservationId(reservationId);
    return paiements.map((item) => this.toPaiementResponse(item));
  }

  /**
   * Get payments by status (admin only)
   */
  async getPaiementsByStatut(statut: string, user: AuthenticatedUser): Promise<PaiementResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const parsed = this.parsePaiementStatut(statut);
    const paiements = await this.repository.findPaiementsByStatut(parsed);
    return paiements.map((item) => this.toPaiementResponse(item));
  }

  /**
   * Confirm a payment
   */
  async confirmerPaiement(
    id: string,
    referenceExterne: string,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateur_id);
    const referenceExterneClean = requireNonBlank(
      referenceExterne,
      'Référence externe requise',
      'PAIEMENT_REFERENCE_REQUIRED',
    );

    const updated = await this.repository.updatePaiement(id, {
      statut: 'CONFIRME',
      reference_externe: referenceExterneClean,
      date_paiement: new Date(),
      updated_at: new Date(),
    });

    await this.paiementLogService.createLogAction(
      id,
      'CONFIRMATION',
      `Paiement confirmé avec référence externe: ${referenceExterneClean}`,
    );

    if (updated.is_escrow && updated.utilisateur_id) {
      await this.escrowService.bloquerFondsEscrow(
        updated.utilisateur_id,
        toNumberOrZero(updated.montant_escrow),
        updated.reference_transaction!,
      );
    }

    return this.toPaiementResponse(updated);
  }

  /**
   * Cancel a payment
   */
  async annulerPaiement(id: string, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateur_id);

    return this.updateStatutPaiement(id, 'ANNULE');
  }

  /**
   * Calculate commission for a payment
   */
  calculateCommission(montant: number): number {
    return Math.round(montant * this.commissionRate * 100) / 100;
  }

  // Private helper methods

  private resolveTargetUtilisateurId(requestedId: string | undefined, currentUser: UserRecord): string {
    if (!hasAnyRole(currentUser.type_utilisateur?.nom, ROLES_ADMIN_MODERATION) || !requestedId) {
      return currentUser.id;
    }
    return requestedId;
  }

  private assertOwnerOrAdmin(currentUser: UserRecord, ownerId: string | null): void {
    if (hasAnyRole(currentUser.type_utilisateur?.nom, ROLES_ADMIN_MODERATION)) {
      return;
    }

    if (!ownerId || currentUser.id !== ownerId) {
      throw new DomainException('Accès refusé', 403, 'ACCESS_DENIED_RESOURCE');
    }
  }

  private parsePaiementStatut(value: string): StatutPaiement {
    const normalized = value.toUpperCase().trim();
    if (!STATUT_PAIEMENT_VALUES.includes(normalized as StatutPaiement)) {
      throw new DomainException('Statut de paiement invalide', 400, 'PAIEMENT_STATUS_INVALID');
    }

    return normalized as StatutPaiement;
  }

  private async updateStatutPaiement(id: string, statut: StatutPaiement): Promise<PaiementResponseDto> {
    const updated = await this.repository.updatePaiement(id, {
      statut,
      date_paiement: statut === 'CONFIRME' ? new Date() : undefined,
      updated_at: new Date(),
    });

    await this.paiementLogService.createLogAction(id, 'STATUT_UPDATE', `Statut changé vers ${statut}`);
    return this.toPaiementResponse(updated);
  }

  private async mustFindCurrentUser(email: string): Promise<UserRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindUser(id: string): Promise<UserRecord> {
    const user = await this.repository.findUserById(id);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindPaiement(id: string): Promise<PaiementRecord> {
    const paiement = await this.repository.findPaiementById(id);
    if (!paiement) {
      throw new DomainException('Paiement non trouvé', 404, 'PAIEMENT_NOT_FOUND');
    }
    return paiement;
  }

  private toPaiementResponse(item: PaiementRecord): PaiementResponseDto {
    return {
      id: item.id,
      utilisateurId: item.utilisateur_id,
      reservationId: item.reservation_id,
      montant: toNullableString(item.montant),
      montantEscrow: toNullableString(item.montant_escrow),
      commission: toNullableString(item.commission),
      statut: item.statut,
      methodePaiement: item.methode_paiement,
      datePaiement: item.date_paiement,
      referenceTransaction: item.reference_transaction,
      referenceExterne: item.reference_externe,
      urlPaiement: item.url_paiement,
      isEscrow: item.is_escrow,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }
}
