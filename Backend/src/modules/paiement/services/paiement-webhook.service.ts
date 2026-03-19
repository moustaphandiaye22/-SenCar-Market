import { createHmac, timingSafeEqual } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';
import type { StatutPaiement } from '../types/paiement.types';

import { PaiementLogService } from './paiement-log.service';

@Injectable()
export class PaiementWebhookService {
  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly paiementLogService: PaiementLogService,
  ) {}

  async processWebhook(payload: string, signature: string, secret: string, provider: string): Promise<string> {
    if (!this.verifyWebhookSignature(payload, signature, secret)) {
      return 'INVALID_SIGNATURE';
    }

    return this.processWebhookPayload(payload, provider);
  }

  private async processWebhookPayload(payload: string, provider: string): Promise<string> {
    try {
      const root = JSON.parse(payload) as Record<string, unknown>;
      const status = this.readFirstNonBlank(root, [
        'status',
        'event',
        'payment_status',
        'transaction_status',
        'etat',
        'state',
      ]);
      const externalRef = this.readFirstNonBlank(root, [
        'reference_externe',
        'external_reference',
        'externalRef',
        'reference',
        'transaction_id',
        'id',
      ]);
      const transactionRef = this.readFirstNonBlank(root, [
        'reference_transaction',
        'merchant_reference',
        'reference',
        'transaction_ref',
        'tx_ref',
      ]);

      if (!externalRef && !transactionRef) {
        return 'IGNORED';
      }

      const paiement = externalRef
        ? await this.repository.findPaiementByReferenceExterne(externalRef)
        : transactionRef
          ? await this.repository.findPaiementByReferenceTransaction(transactionRef)
          : null;

      if (!paiement) {
        return 'NOT_FOUND';
      }

      const nouveauStatut = this.mapWebhookStatus(status);
      if (!nouveauStatut) {
        await this.paiementLogService.createLogAction(
          paiement.id,
          'WEBHOOK_IGNORED',
          `Provider=${provider}, statut non mappé='${status ?? ''}'`,
        );
        return 'IGNORED';
      }

      if (paiement.statut === nouveauStatut && paiement.date_paiement) {
        await this.paiementLogService.createLogAction(
          paiement.id,
          'WEBHOOK_DUPLICATE',
          `Provider=${provider}, statut=${status ?? ''}`,
        );
        return 'SUCCESS';
      }

      await this.repository.updatePaiement(paiement.id, {
        statut: nouveauStatut,
        reference_externe: paiement.reference_externe ?? externalRef ?? undefined,
        date_paiement: nouveauStatut === 'CONFIRME' ? new Date() : undefined,
        updated_at: new Date(),
      });

      await this.paiementLogService.createLogAction(
        paiement.id,
        'WEBHOOK_UPDATE',
        `Provider=${provider}, statut brut=${status ?? ''}, ${paiement.statut ?? ''} -> ${nouveauStatut}`,
      );
      return 'SUCCESS';
    } catch {
      return 'INVALID_PAYLOAD';
    }
  }

  private verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!secret || !payload || !signature) {
      return false;
    }

    const normalized = signature.trim().replace(/^sha256=/i, '');
    const digest = createHmac('sha256', secret).update(payload, 'utf8').digest();
    const expectedHex = digest.toString('hex');
    const expectedBase64 = digest.toString('base64');

    return this.safeEqual(normalized, expectedHex) || this.safeEqual(normalized, expectedBase64);
  }

  private safeEqual(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a, 'utf8');
    const bBuffer = Buffer.from(b, 'utf8');
    if (aBuffer.length !== bBuffer.length) {
      return false;
    }
    return timingSafeEqual(aBuffer, bBuffer);
  }

  private readFirstNonBlank(root: Record<string, unknown>, fields: string[]): string | null {
    for (const field of fields) {
      const value = root[field];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    const data = root.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const nested = data as Record<string, unknown>;
      for (const field of fields) {
        const value = nested[field];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
      }
    }

    return null;
  }

  private mapWebhookStatus(status: string | null): StatutPaiement | null {
    if (!status) {
      return null;
    }

    const normalized = status.toUpperCase().trim();
    if (['SUCCESS', 'SUCCES', 'PAID', 'CONFIRM'].some((item) => normalized.includes(item))) {
      return 'CONFIRME';
    }
    if (['FAIL', 'ERROR', 'ECHOUE', 'FAILED'].some((item) => normalized.includes(item))) {
      return 'ECHOUE';
    }
    if (['CANCEL', 'ANNULE'].some((item) => normalized.includes(item))) {
      return 'ANNULE';
    }
    if (['REFUND', 'REMBOUR'].some((item) => normalized.includes(item))) {
      return 'REMBOURSE';
    }
    if (['PENDING', 'WAIT', 'EN_ATTENTE'].some((item) => normalized.includes(item))) {
      return 'EN_ATTENTE';
    }

    return null;
  }
}
