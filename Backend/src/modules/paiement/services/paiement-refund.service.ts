import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ROLES_ADMIN_SUPER_ADMIN,
} from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { assertHasAnyRole } from '../../../common/utils/authorization.util';
import { PaiementResponseDto } from '../dto/paiement-response.dto';
import { UserRecord } from '../paiement.models';
import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';

import { PaiementCoreService } from './paiement-core.service';
import { PaiementLogService } from './paiement-log.service';

/**
 * Payment Refund Service - Single Responsibility for refunds and commissions
 * Handles refund operations and commission calculations
 */
@Injectable()
export class PaiementRefundService {
  private readonly commissionRate: number;

  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly configService: ConfigService,
    private readonly coreService: PaiementCoreService,
    private readonly paiementLogService: PaiementLogService,
  ) {
    this.commissionRate = Number(this.configService.get<string>('PAIEMENTS_COMMISSION_TAUX', '0.05'));
  }

  /**
   * Process a refund
   */
  async remboursementPaiement(
    id: string,
    montant: number,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN);
    this.assertNonNegativeFiniteAmount(montant, 'Montant de remboursement invalide', 'PAIEMENT_REFUND_AMOUNT_INVALID');

    const paiement = await this.mustFindPaiement(id);
    const updated = await this.repository.updatePaiement(paiement.id, {
      statut: 'REMBOURSE',
      updatedAt: new Date(),
    });
    await this.paiementLogService.createLogAction(id, 'REMBOURSEMENT', `Remboursement de ${montant}`);

    return this.toPaiementResponse(updated);
  }

  /**
   * Process refund from raw string input
   */
  async remboursementPaiementFromRaw(
    id: string,
    montantRaw: string | undefined,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const montant = this.parseNonNegativeAmount(
      montantRaw,
      'Montant de remboursement invalide',
      'PAIEMENT_REFUND_AMOUNT_INVALID',
    );
    return this.remboursementPaiement(id, montant, user);
  }

  /**
   * Calculate commission for a user
   */
  async calculateCommissionForUser(montant: number, user: AuthenticatedUser): Promise<number> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN);
    this.assertNonNegativeFiniteAmount(montant, 'Montant invalide', 'PAIEMENT_AMOUNT_INVALID');
    return this.calculateCommission(montant);
  }

  /**
   * Calculate commission from raw string input
   */
  async calculateCommissionForUserFromRaw(
    montantRaw: string | undefined,
    user: AuthenticatedUser,
  ): Promise<number> {
    const montant = this.parseNonNegativeAmount(montantRaw, 'Montant invalide', 'PAIEMENT_AMOUNT_INVALID');
    return this.calculateCommissionForUser(montant, user);
  }

  /**
   * Calculate commission amount
   */
  calculateCommission(montant: number): number {
    return Math.round(montant * this.commissionRate * 100) / 100;
  }

  // Private helpers

  private assertNonNegativeFiniteAmount(value: number, message: string, code: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new DomainException(message, 400, code);
    }
  }

  private parseNonNegativeAmount(
    value: string | undefined,
    message: string,
    code: string,
  ): number {
    if (!value) {
      throw new DomainException(message, 400, code);
    }
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new DomainException(message, 400, code);
    }
    return parsed;
  }

  private async mustFindCurrentUser(email: string): Promise<UserRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindPaiement(id: string) {
    const paiement = await this.repository.findPaiementById(id);
    if (!paiement) {
      throw new DomainException('Paiement non trouvé', 404, 'PAIEMENT_NOT_FOUND');
    }
    return paiement;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toPaiementResponse(item: any): PaiementResponseDto {
    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      reservationId: item.reservationId,
      montant: String(item.montant),
      montantEscrow: String(item.montantEscrow ?? 0),
      commission: String(item.commission ?? 0),
      statut: item.statut,
      methodePaiement: item.methodePaiement,
      datePaiement: item.datePaiement,
      referenceTransaction: item.referenceTransaction,
      referenceExterne: item.referenceExterne,
      urlPaiement: item.urlPaiement,
      isEscrow: item.isEscrow,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
