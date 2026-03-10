import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ROLES_ADMIN_MODERATION } from '../../../common/constants/role-groups';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { hasAnyRole } from '../../../common/utils/role.util';
import { CreatePaiementRequestDto } from '../dto/create-paiement-request.dto';
import { PaiementResponseDto } from '../dto/paiement-response.dto';
import { UserRecord } from '../paiement.models';
import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';

import { PaiementCoreService } from './paiement-core.service';
import { PaiementWebhookService } from './paiement-webhook.service';

/**
 * Payment Provider Service - Single Responsibility for payment provider integrations
 * Handles Wave, Orange Money, and other payment provider specific operations
 */
@Injectable()
export class PaiementProviderService {
  private readonly wavePayUrlBase: string;
  private readonly omPayUrlBase: string;
  private readonly waveSecret: string;
  private readonly omSecret: string;

  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly configService: ConfigService,
    private readonly coreService: PaiementCoreService,
    private readonly webhookService: PaiementWebhookService,
  ) {
    this.wavePayUrlBase = this.configService.get<string>('PAIEMENTS_WAVE_PAY_URL_BASE', 'https://wave.com/pay');
    this.omPayUrlBase = this.configService.get<string>('PAIEMENTS_OM_PAY_URL_BASE', 'https://om.sn/pay');
    this.waveSecret = this.configService.get<string>('PAIEMENTS_WAVE_SECRET', '');
    this.omSecret = this.configService.get<string>('PAIEMENTS_OM_SECRET', '');
  }

  /**
   * Create payment with Wave
   */
  async createPaiementWave(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const paiement = await this.coreService.createPaiement(request, user);
    const updated = await this.repository.updatePaiement(paiement.id, {
      urlPaiement: this.buildPaymentUrl(this.wavePayUrlBase),
      updatedAt: new Date(),
    });
    return this.toPaiementResponse(updated);
  }

  /**
   * Create payment with Orange Money
   */
  async createPaiementOrangeMoney(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    const paiement = await this.coreService.createPaiement(request, user);
    const updated = await this.repository.updatePaiement(paiement.id, {
      urlPaiement: this.buildPaymentUrl(this.omPayUrlBase),
      updatedAt: new Date(),
    });
    return this.toPaiementResponse(updated);
  }

  /**
   * Create escrow payment
   */
  async createPaiementEscrow(
    request: CreatePaiementRequestDto,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.coreService.createPaiement({ ...request, isEscrow: true }, user);
  }

  /**
   * Process payment release after confirmation
   */
  async confirmerReceptionEtLiberer(
    id: string,
    user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
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
      // Import and use escrow service would be needed here
    }

    return this.toPaiementResponse(paiement);
  }

  /**
   * Process webhook from any payment provider
   */
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

  /**
   * Process Wave webhook
   */
  async processWaveWebhook(payload: string, signature: string): Promise<string> {
    return this.processWebhook(payload, signature, 'WAVE');
  }

  /**
   * Process Wave webhook from payload
   */
  async processWaveWebhookFromPayload(payload: unknown, signature: string): Promise<string> {
    return this.processWaveWebhook(this.normalizeWebhookPayload(payload), signature);
  }

  /**
   * Process Orange Money webhook
   */
  async processOrangeMoneyWebhook(payload: string, signature: string): Promise<string> {
    return this.processWebhook(payload, signature, 'ORANGE_MONEY');
  }

  /**
   * Process Orange Money webhook from payload
   */
  async processOrangeMoneyWebhookFromPayload(payload: unknown, signature: string): Promise<string> {
    return this.processOrangeMoneyWebhook(this.normalizeWebhookPayload(payload), signature);
  }

  // Private helpers

  private buildPaymentUrl(baseUrl: string): string {
    const cleaned = baseUrl.trim().replace(/\/+$/g, '');
    return `${cleaned}/${this.repository.newId().slice(0, 8)}`;
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

  private assertOwnerOrAdmin(currentUser: UserRecord, ownerId: string | null): void {
    // Admin roles can perform this action
    if (hasAnyRole(currentUser.typeUtilisateur?.nom, ROLES_ADMIN_MODERATION)) {
      return;
    }
    // Otherwise, check ownership
    if (!ownerId || currentUser.id !== ownerId) {
      throw new DomainException('Accès refusé', 403, 'ACCESS_DENIED_RESOURCE');
    }
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

  private toPaiementResponse(item: unknown): PaiementResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = item as any;
    return {
      id: p.id,
      utilisateurId: p.utilisateurId,
      reservationId: p.reservationId,
      montant: String(p.montant),
      montantEscrow: String(p.montantEscrow ?? 0),
      commission: String(p.commission ?? 0),
      statut: p.statut,
      methodePaiement: p.methodePaiement,
      datePaiement: p.datePaiement,
      referenceTransaction: p.referenceTransaction,
      referenceExterne: p.referenceExterne,
      urlPaiement: p.urlPaiement,
      isEscrow: p.isEscrow,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
