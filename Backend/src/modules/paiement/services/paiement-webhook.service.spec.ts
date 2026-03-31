import { createHmac } from 'crypto';

import type { PaiementRecord } from '../paiement.models';
import type { PaiementRepositoryPort } from '../paiement.repository.port';

import type { PaiementLogService } from './paiement-log.service';
import { PaiementWebhookService } from './paiement-webhook.service';

describe('PaiementWebhookService', () => {
  let repository: jest.Mocked<PaiementRepositoryPort>;
  let paiementLogService: jest.Mocked<PaiementLogService>;
  let service: PaiementWebhookService;

  const paiement: PaiementRecord = {
    id: 'pay-1',
    utilisateur_id: 'user-1',
    reservation_id: null,
    montant: 1000,
    montant_escrow: 0,
    commission: 0,
    statut: 'EN_ATTENTE',
    methode_paiement: 'WAVE',
    date_paiement: null,
    reference_transaction: 'tx-ref',
    reference_externe: 'ext-ref',
    url_paiement: null,
    is_escrow: false,
    date_expiration: null,
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    updated_at: new Date('2026-03-01T00:00:00.000Z'),
    utilisateur: { id: 'user-1' },
    reservation: null,
  };

  const sign = (payload: string, secret: string) =>
    createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

  beforeEach(() => {
    repository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      findReservationById: jest.fn(),
      createPaiement: jest.fn(),
      updatePaiement: jest.fn(),
      findPaiementById: jest.fn(),
      findPaiementsByUtilisateurId: jest.fn(),
      findPaiementsByReservationId: jest.fn(),
      findPaiementsByStatut: jest.fn(),
      findPaiementByReferenceExterne: jest.fn(),
      findPaiementByReferenceTransaction: jest.fn(),
      findPortefeuilleByUtilisateurId: jest.fn(),
      createPortefeuille: jest.fn(),
      updatePortefeuille: jest.fn(),
      createTransaction: jest.fn(),
      findTransactionById: jest.fn(),
      findTransactionsByUtilisateurId: jest.fn(),
      hasEscrowReleaseTransaction: jest.fn(),
      transactionBelongsToUser: jest.fn(),
      createPaiementLog: jest.fn(),
      findLogsByPaiementId: jest.fn(),
      newId: jest.fn().mockReturnValue('generated-id'),
    } as unknown as jest.Mocked<PaiementRepositoryPort>;

    paiementLogService = {
      createLogAction: jest.fn(),
    } as unknown as jest.Mocked<PaiementLogService>;

    service = new PaiementWebhookService(repository, paiementLogService);
  });

  it('rejects webhook processing when the signature is invalid', async () => {
    await expect(
      service.processWebhook('{"status":"SUCCESS"}', 'bad-signature', 'secret', 'WAVE'),
    ).resolves.toBe('INVALID_SIGNATURE');
  });

  it('ignores payloads without references', async () => {
    const payload = JSON.stringify({ status: 'SUCCESS' });

    await expect(
      service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'WAVE'),
    ).resolves.toBe('IGNORED');
  });

  it('returns not found when no payment matches the webhook reference', async () => {
    const payload = JSON.stringify({
      status: 'SUCCESS',
      external_reference: 'ext-ref',
    });
    repository.findPaiementByReferenceExterne.mockResolvedValue(null);

    await expect(
      service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'WAVE'),
    ).resolves.toBe('NOT_FOUND');
  });

  it('updates a payment from an external reference and logs the transition', async () => {
    const payload = JSON.stringify({
      status: 'SUCCESS',
      external_reference: 'ext-ref',
    });
    repository.findPaiementByReferenceExterne.mockResolvedValue(paiement);
    repository.updatePaiement.mockResolvedValue({
      ...paiement,
      statut: 'CONFIRME',
      date_paiement: new Date('2026-03-02T00:00:00.000Z'),
    });

    await expect(
      service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'WAVE'),
    ).resolves.toBe('SUCCESS');

    expect(repository.updatePaiement).toHaveBeenCalledWith(
      'pay-1',
      expect.objectContaining({
        statut: 'CONFIRME',
      }),
    );
    expect(paiementLogService.createLogAction).toHaveBeenCalledWith(
      'pay-1',
      'WEBHOOK_UPDATE',
      expect.stringContaining('EN_ATTENTE -> CONFIRME'),
    );
  });

  it('handles nested payload data and duplicate confirmations', async () => {
    const payload = JSON.stringify({
      data: {
        payment_status: 'paid',
        merchant_reference: 'tx-ref',
      },
    });
    repository.findPaiementByReferenceTransaction.mockResolvedValue({
      ...paiement,
      statut: 'CONFIRME',
      date_paiement: new Date('2026-03-02T00:00:00.000Z'),
    });

    await expect(
      service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'OM'),
    ).resolves.toBe('SUCCESS');

    expect(repository.updatePaiement).not.toHaveBeenCalled();
    expect(paiementLogService.createLogAction).toHaveBeenCalledWith(
      'pay-1',
      'WEBHOOK_DUPLICATE',
      expect.stringContaining('statut=paid'),
    );
  });

  it('logs unmapped statuses as ignored', async () => {
    const payload = JSON.stringify({
      state: 'review_needed',
      reference_externe: 'ext-ref',
    });
    repository.findPaiementByReferenceExterne.mockResolvedValue(paiement);

    await expect(
      service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'WAVE'),
    ).resolves.toBe('IGNORED');

    expect(paiementLogService.createLogAction).toHaveBeenCalledWith(
      'pay-1',
      'WEBHOOK_IGNORED',
      expect.stringContaining("statut non mappé='review_needed'"),
    );
  });

  it('maps failure, cancel, refund and pending statuses', async () => {
    const statuses = [
      ['FAILED', 'ECHOUE'],
      ['ANNULE', 'ANNULE'],
      ['REFUND_DONE', 'REMBOURSE'],
      ['pending_review', 'EN_ATTENTE'],
    ] as const;

    for (const [rawStatus, expected] of statuses) {
      const payload = JSON.stringify({
        status: rawStatus,
        external_reference: 'ext-ref',
      });
      repository.findPaiementByReferenceExterne.mockResolvedValue(paiement);
      repository.updatePaiement.mockResolvedValue({
        ...paiement,
        statut: expected,
      });

      await expect(
        service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'WAVE'),
      ).resolves.toBe('SUCCESS');
    }

    expect(repository.updatePaiement).toHaveBeenCalledTimes(4);
  });

  it('returns invalid payload when the body is not valid json', async () => {
    const payload = '{invalid-json';

    await expect(
      service.processWebhook(payload, sign(payload, 'secret'), 'secret', 'WAVE'),
    ).resolves.toBe('INVALID_PAYLOAD');
  });
});
