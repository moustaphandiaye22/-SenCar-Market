import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ROLES_ADMIN_MODERATION,
  ROLES_ADMIN_SUPER_ADMIN,
} from '../../common/constants/role-groups';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { assertHasAnyRole } from '../../common/utils/authorization.util';
import { toNullableString, toNumberOrZero } from '../../common/utils/number.util';
import { buildPaginatedResponse, clampPage, clampSize } from '../../common/utils/pagination.util';
import { hasAnyRole } from '../../common/utils/role.util';
import { requireNonBlank } from '../../common/utils/text.util';

import { CreatePaiementRequestDto } from './dto/create-paiement-request.dto';
import { PaiementLogResponseDto } from './dto/paiement-log-response.dto';
import { PaiementResponseDto } from './dto/paiement-response.dto';
import { PortefeuilleResponseDto } from './dto/portefeuille-response.dto';
import { RetraitRequestDto } from './dto/retrait-request.dto';
import { TransactionPortefeuilleRequestDto } from './dto/transaction-portefeuille-request.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import {
  PaiementLogRecord,
  PaiementRecord,
  PortefeuilleRecord,
  TransactionRecord,
  UserRecord,
} from './paiement.models';
import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from './paiement.repository.port';
import { PaiementEscrowService } from './services/paiement-escrow.service';
import { PaiementLogService } from './services/paiement-log.service';
import { PaiementWalletService } from './services/paiement-wallet.service';
import { PaiementWebhookService } from './services/paiement-webhook.service';
import {
  STATUT_PAIEMENT_VALUES,
  STATUT_TRANSACTION_VALUES,
  StatutPaiement,
  StatutTransaction,
} from './types/paiement.types';
import { PaiementAmountValidator } from './validation/paiement-amount.validator';

@Injectable()
export class PaiementService {
  private readonly commissionRate: number;
  private readonly wavePayUrlBase: string;
  private readonly omPayUrlBase: string;
  private readonly waveSecret: string;
  private readonly omSecret: string;

  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly configService: ConfigService,
    private readonly webhookService: PaiementWebhookService,
    private readonly walletService: PaiementWalletService,
    private readonly escrowService: PaiementEscrowService,
    private readonly paiementLogService: PaiementLogService,
    private readonly inputValidator: PaiementAmountValidator,
  ) {
    this.commissionRate = Number(this.configService.get<string>('PAIEMENTS_COMMISSION_TAUX', '0.05'));
    this.wavePayUrlBase = this.configService.get<string>('PAIEMENTS_WAVE_PAY_URL_BASE', 'https://wave.com/pay');
    this.omPayUrlBase = this.configService.get<string>('PAIEMENTS_OM_PAY_URL_BASE', 'https://om.sn/pay');
    this.waveSecret = this.configService.get<string>('PAIEMENTS_WAVE_SECRET', '');
    this.omSecret = this.configService.get<string>('PAIEMENTS_OM_SECRET', '');
  }

  async createPaiement(request: CreatePaiementRequestDto, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const utilisateurId = this.resolveTargetUtilisateurId(request.utilisateurId, currentUser);
    const targetUser = await this.mustFindUser(utilisateurId);

    // For reservation payments, reservationId is required
    if (!request.reservationId) {
      throw new DomainException('Réservation requise pour ce type de paiement', 400, 'RESERVATION_REQUIRED');
    }

    const reservation = await this.repository.findReservationById(request.reservationId);
    if (!reservation) {
      throw new DomainException('Réservation non trouvée', 404, 'RESERVATION_NOT_FOUND');
    }

    const isEscrow = Boolean(request.isEscrow);
    const commission = isEscrow ? this.calculateCommission(request.montant) : 0;
    const montantEscrow = isEscrow ? request.montant - commission : request.montant;

    const created = await this.repository.createPaiement({
      id: this.repository.newId(),
      utilisateur: { connect: { id: targetUser.id } },
      reservation: { connect: { id: reservation.id } },
      montant: request.montant,
      montantEscrow,
      commission,
      methodePaiement: request.methodePaiement,
      statut: 'EN_ATTENTE',
      isEscrow,
      referenceTransaction: this.repository.newId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.paiementLogService.createLogAction(created.id, 'CREATION', 'Paiement créé');
    return this.toPaiementResponse(created);
  }

  async createPaiementWave(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const paiement = await this.createPaiement(request, user);
    const updated = await this.repository.updatePaiement(paiement.id, {
      urlPaiement: this.buildPaymentUrl(this.wavePayUrlBase),
      updatedAt: new Date(),
    });
    return this.toPaiementResponse(updated);
  }

  async createPaiementOrangeMoney(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const paiement = await this.createPaiement(request, user);
    const updated = await this.repository.updatePaiement(paiement.id, {
      urlPaiement: this.buildPaymentUrl(this.omPayUrlBase),
      updatedAt: new Date(),
    });
    return this.toPaiementResponse(updated);
  }

  async createPaiementEscrow(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.createPaiement({ ...request, isEscrow: true }, user);
  }

  async getPaiementById(id: string, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateurId);
    return this.toPaiementResponse(paiement);
  }

  async getAllPaiements(page: number, size: number, user: AuthenticatedUser): Promise<PaginatedResponseDto<PaiementResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION);

    const clampedPage = clampPage(page);
    const clampedSize = clampSize(size, 20, 100);
    const { items, total } = await this.repository.findAllPaiementsPaged(clampedPage, clampedSize);

    return buildPaginatedResponse(
      items.map((item) => this.toPaiementResponse(item)),
      total,
      clampedPage,
      clampedSize,
    );
  }

  async getPaiementsByUtilisateur(utilisateurId: string, user: AuthenticatedUser): Promise<PaiementResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.assertOwnerOrAdmin(currentUser, utilisateurId);

    const paiements = await this.repository.findPaiementsByUtilisateurId(utilisateurId);
    return paiements.map((item) => this.toPaiementResponse(item));
  }

  async getPaiementsByReservation(
    reservationId: string,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION);

    const paiements = await this.repository.findPaiementsByReservationId(reservationId);
    return paiements.map((item) => this.toPaiementResponse(item));
  }

  async getPaiementsByStatut(statut: string, user: AuthenticatedUser): Promise<PaiementResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION);

    const parsed = this.parsePaiementStatut(statut);
    const paiements = await this.repository.findPaiementsByStatut(parsed);
    return paiements.map((item) => this.toPaiementResponse(item));
  }

  async confirmerPaiement(
    id: string,
    referenceExterne: string,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateurId);
    const referenceExterneClean = requireNonBlank(
      referenceExterne,
      'Référence externe requise',
      'PAIEMENT_REFERENCE_REQUIRED',
    );

    const updated = await this.repository.updatePaiement(id, {
      statut: 'CONFIRME',
      referenceExterne: referenceExterneClean,
      datePaiement: new Date(),
      updatedAt: new Date(),
    });

    await this.paiementLogService.createLogAction(
      id,
      'CONFIRMATION',
      `Paiement confirmé avec référence externe: ${referenceExterneClean}`,
    );

    if (updated.isEscrow && updated.utilisateurId) {
      await this.escrowService.bloquerFondsEscrow(
        updated.utilisateurId,
        toNumberOrZero(updated.montantEscrow),
        updated.referenceTransaction,
      );
    }

    return this.toPaiementResponse(updated);
  }

  async annulerPaiement(id: string, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateurId);

    return this.updateStatutPaiement(id, 'ANNULE');
  }

  async remboursementPaiement(id: string, montant: number, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN);
    this.assertNonNegativeFiniteAmount(
      montant,
      'Montant de remboursement invalide',
      'PAIEMENT_REFUND_AMOUNT_INVALID',
    );

    const paiement = await this.mustFindPaiement(id);
    const updated = await this.repository.updatePaiement(paiement.id, {
      statut: 'REMBOURSE',
      updatedAt: new Date(),
    });
    await this.paiementLogService.createLogAction(id, 'REMBOURSEMENT', `Remboursement de ${montant}`);

    return this.toPaiementResponse(updated);
  }

  async remboursementPaiementFromRaw(
    id: string,
    montantRaw: string | undefined,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const montant = this.inputValidator.parseNonNegativeAmount(
      montantRaw,
      'Montant de remboursement invalide',
      'PAIEMENT_REFUND_AMOUNT_INVALID',
    );
    return this.remboursementPaiement(id, montant, user);
  }

  async confirmerReceptionEtLiberer(id: string, user: AuthenticatedUser): Promise<PaiementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const paiement = await this.mustFindPaiement(id);
    this.assertOwnerOrAdmin(currentUser, paiement.utilisateurId);
    if (paiement.isEscrow !== true) {
      throw new DomainException('Libération possible uniquement pour un paiement escrow', 400, 'ESCROW_NOT_ENABLED');
    }
    if (paiement.statut !== 'CONFIRME') {
      throw new DomainException('Paiement doit être confirmé avant libération', 400, 'ESCROW_RELEASE_REQUIRES_CONFIRMED_PAYMENT');
    }
    const reference = paiement.referenceTransaction;
    if (!reference) {
      throw new DomainException('Référence transaction manquante', 400, 'ESCROW_REFERENCE_MISSING');
    }

    const proprietaireId = paiement.reservation?.annonceLocation?.proprietaireId;
    if (proprietaireId) {
      const alreadyReleased = await this.repository.hasEscrowReleaseTransaction(proprietaireId, reference);
      if (alreadyReleased) {
        throw new DomainException('Fonds escrow déjà libérés', 400, 'ESCROW_ALREADY_RELEASED');
      }
      await this.escrowService.libererFondsEscrow(proprietaireId, toNumberOrZero(paiement.montantEscrow), reference);
    }

    await this.paiementLogService.createLogAction(id, 'ESCROW_RELEASE', 'Fonds escrow libérés');
    return this.toPaiementResponse(paiement);
  }

  async processWebhook(
    payload: string,
    signature: string,
    provider: 'WAVE' | 'ORANGE_MONEY',
  ): Promise<string> {
    const secret = provider === 'WAVE' ? this.waveSecret : this.omSecret;
    const result = await this.webhookService.processWebhook(payload, signature, secret, provider);
    this.assertWebhookResult(result);
    return result;
  }

  async processWaveWebhook(payload: string, signature: string): Promise<string> {
    return this.processWebhook(payload, signature, 'WAVE');
  }

  async processWaveWebhookFromPayload(payload: unknown, signature: string): Promise<string> {
    return this.processWaveWebhook(this.normalizeWebhookPayload(payload), signature);
  }

  async processOrangeMoneyWebhook(payload: string, signature: string): Promise<string> {
    return this.processWebhook(payload, signature, 'ORANGE_MONEY');
  }

  async processOrangeMoneyWebhookFromPayload(payload: unknown, signature: string): Promise<string> {
    return this.processOrangeMoneyWebhook(this.normalizeWebhookPayload(payload), signature);
  }

  async getOrCreatePortefeuille(utilisateurId: string, user: AuthenticatedUser): Promise<PortefeuilleResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.assertOwnerOrAdmin(currentUser, utilisateurId);

    const portefeuille = await this.walletService.getOrCreatePortefeuilleEntity(utilisateurId);
    return this.toPortefeuilleResponse(portefeuille);
  }

  async crediterPortefeuille(
    request: TransactionPortefeuilleRequestDto,
    user: AuthenticatedUser,
  ): Promise<PortefeuilleResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const updated = await this.walletService.crediterPortefeuille(request, currentUser.id);
    return this.toPortefeuilleResponse(updated);
  }

  async debiterPortefeuille(
    request: TransactionPortefeuilleRequestDto,
    user: AuthenticatedUser,
  ): Promise<PortefeuilleResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const updated = await this.walletService.debiterPortefeuille(request, currentUser.id);
    return this.toPortefeuilleResponse(updated);
  }

  async demanderRetrait(request: RetraitRequestDto, user: AuthenticatedUser): Promise<TransactionResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const created = await this.walletService.demanderRetrait(request, currentUser.id);
    return this.toTransactionResponse(created);
  }

  async getHistoriqueTransactions(
    utilisateurId: string,
    user: AuthenticatedUser,
  ): Promise<TransactionResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.assertOwnerOrAdmin(currentUser, utilisateurId);

    const transactions = await this.repository.findTransactionsByUtilisateurId(utilisateurId);
    return transactions.map((item) => this.toTransactionResponse(item));
  }

  async getTransactionById(id: string, user: AuthenticatedUser): Promise<TransactionResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    if (!hasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION)) {
      const owned = await this.repository.transactionBelongsToUser(id, currentUser.id);
      if (!owned) {
        throw new DomainException('Accès refusé', 403, 'ACCESS_DENIED_RESOURCE');
      }
    }

    const transaction = await this.repository.findTransactionById(id);
    if (!transaction) {
      throw new DomainException('Transaction non trouvée', 404, 'TRANSACTION_NOT_FOUND');
    }

    return this.toTransactionResponse(transaction);
  }

  async getLogsByPaiement(id: string, user: AuthenticatedUser): Promise<PaiementLogResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION);

    const logs = await this.repository.findLogsByPaiementId(id);
    return logs.map((item) => this.toPaiementLogResponse(item));
  }

  async calculateCommissionForUser(montant: number, user: AuthenticatedUser): Promise<number> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    assertHasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN);
    this.assertNonNegativeFiniteAmount(montant, 'Montant invalide', 'PAIEMENT_AMOUNT_INVALID');
    return this.calculateCommission(montant);
  }

  async calculateCommissionForUserFromRaw(montantRaw: string | undefined, user: AuthenticatedUser): Promise<number> {
    const montant = this.inputValidator.parseNonNegativeAmount(
      montantRaw,
      'Montant invalide',
      'PAIEMENT_AMOUNT_INVALID',
    );
    return this.calculateCommissionForUser(montant, user);
  }

  private async updateStatutPaiement(id: string, statut: StatutPaiement): Promise<PaiementResponseDto> {
    const updated = await this.repository.updatePaiement(id, {
      statut,
      datePaiement: statut === 'CONFIRME' ? new Date() : undefined,
      updatedAt: new Date(),
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

  private resolveTargetUtilisateurId(requestedId: string | undefined, currentUser: UserRecord): string {
    if (!hasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION) || !requestedId) {
      return currentUser.id;
    }
    return requestedId;
  }

  private assertOwnerOrAdmin(currentUser: UserRecord, ownerId: string | null): void {
    if (hasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION)) {
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

  private calculateCommission(montant: number): number {
    return Math.round(montant * this.commissionRate * 100) / 100;
  }

  private buildPaymentUrl(baseUrl: string): string {
    const cleaned = baseUrl.trim().replace(/\/+$/g, '');
    return `${cleaned}/${this.repository.newId().slice(0, 8)}`;
  }

  private assertNonNegativeFiniteAmount(value: number, message: string, code: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new DomainException(message, 400, code);
    }
  }

  private assertWebhookResult(result: string): void {
    if (result === 'INVALID_SIGNATURE') {
      throw new DomainException('Signature webhook invalide', 400, 'PAIEMENT_WEBHOOK_SIGNATURE_INVALID');
    }
    if (result === 'INVALID_PAYLOAD') {
      throw new DomainException('Payload webhook invalide', 400, 'PAIEMENT_WEBHOOK_PAYLOAD_INVALID');
    }
  }

  private normalizeWebhookPayload(payload: unknown): string {
    return typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
  }


  private toPaiementResponse(item: PaiementRecord): PaiementResponseDto {
    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      reservationId: item.reservationId,
      montant: toNullableString(item.montant),
      montantEscrow: toNullableString(item.montantEscrow),
      commission: toNullableString(item.commission),
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

  private toPortefeuilleResponse(item: PortefeuilleRecord): PortefeuilleResponseDto {
    const solde = toNumberOrZero(item.solde);
    const soldeBloque = toNumberOrZero(item.soldeBloque);

    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      solde: String(solde),
      soldeBloque: String(soldeBloque),
      soldeDisponible: String(solde - soldeBloque),
      dateDerniereRecharge: item.dateDerniereRecharge,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toTransactionResponse(item: TransactionRecord): TransactionResponseDto {
    return {
      id: item.id,
      portefeuilleId: item.portefeuilleId,
      montant: toNullableString(item.montant) ?? '0',
      typeTransaction: item.typeTransaction,
      statut: this.parseStatutTransaction(item.statut),
      description: item.description,
      referenceExterne: item.referenceExterne,
      dateTransaction: item.dateTransaction,
      createdAt: item.createdAt,
    };
  }

  private toPaiementLogResponse(item: PaiementLogRecord): PaiementLogResponseDto {
    return {
      id: item.id,
      paiementId: item.paiementId,
      action: item.action,
      details: item.details,
      dateAction: item.dateAction,
    };
  }

  private parseStatutTransaction(value: string): StatutTransaction {
    if (!STATUT_TRANSACTION_VALUES.includes(value as StatutTransaction)) {
      return 'EN_ATTENTE';
    }
    return value as StatutTransaction;
  }

}
