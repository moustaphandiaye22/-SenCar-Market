import type { ConfigService } from '@nestjs/config';

import type {
  PaiementRecord,
  ReservationRecord,
  UserRecord,
} from '../paiement.models';
import type { PaiementRepositoryPort } from '../paiement.repository.port';

import { PaiementCoreService } from './paiement-core.service';
import type { PaiementEscrowService } from './paiement-escrow.service';
import type { PaiementLogService } from './paiement-log.service';
import { PaiementProviderService } from './paiement-provider.service';
import type { PaiementWebhookService } from './paiement-webhook.service';

describe('PaiementCoreService', () => {
  let repository: jest.Mocked<PaiementRepositoryPort>;
  let configService: ConfigService;
  let escrowService: jest.Mocked<PaiementEscrowService>;
  let paiementLogService: jest.Mocked<PaiementLogService>;
  let webhookService: jest.Mocked<PaiementWebhookService>;
  let coreService: PaiementCoreService;
  let providerService: PaiementProviderService;

  const currentUser: UserRecord = {
    id: 'user-1',
    email: 'user@test.com',
    type_utilisateur: { nom: 'UTILISATEUR' },
  };

  const adminUser: UserRecord = {
    id: 'admin-1',
    email: 'admin@test.com',
    type_utilisateur: { nom: 'ADMIN' },
  };

  const paiementRecord: PaiementRecord = {
    id: 'pay-1',
    utilisateur_id: 'user-1',
    reservation_id: 'reservation-1',
    montant: 10000,
    montant_escrow: 9500,
    commission: 500,
    statut: 'EN_ATTENTE',
    methode_paiement: 'WAVE',
    date_paiement: null,
    reference_transaction: 'ref-tx',
    reference_externe: null,
    url_paiement: null,
    is_escrow: true,
    date_expiration: null,
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    updated_at: new Date('2026-03-01T00:00:00.000Z'),
    utilisateur: { id: 'user-1' },
    reservation: {
      id: 'reservation-1',
      annonce_location: { proprietaire_id: 'owner-1' },
    },
  };

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
      newId: jest
        .fn()
        .mockReturnValueOnce('pay-1')
        .mockReturnValueOnce('ref-tx')
        .mockReturnValue('generated-id'),
    } as unknown as jest.Mocked<PaiementRepositoryPort>;

    configService = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'PAIEMENTS_COMMISSION_TAUX') return '0.05';
        if (key === 'PAIEMENTS_WAVE_PAY_URL_BASE') return 'https://wave.test/pay/';
        if (key === 'PAIEMENTS_OM_PAY_URL_BASE') return 'https://om.test/pay/';
        if (key === 'PAIEMENTS_WAVE_SECRET') return 'wave-secret';
        if (key === 'PAIEMENTS_OM_SECRET') return 'om-secret';
        return fallback;
      }),
    } as unknown as ConfigService;

    escrowService = {
      bloquerFondsEscrow: jest.fn(),
    } as unknown as jest.Mocked<PaiementEscrowService>;

    paiementLogService = {
      createLogAction: jest.fn(),
    } as unknown as jest.Mocked<PaiementLogService>;

    webhookService = {
      processWebhook: jest.fn(),
    } as unknown as jest.Mocked<PaiementWebhookService>;

    coreService = new PaiementCoreService(
      repository,
      configService,
      escrowService,
      paiementLogService,
    );

    providerService = new PaiementProviderService(
      repository,
      configService,
      coreService,
      webhookService,
    );
  });

  it('creates a standard payment for the current user', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findUserById.mockResolvedValue(currentUser);
    repository.createPaiement.mockResolvedValue({
      ...paiementRecord,
      is_escrow: false,
      montant_escrow: 10000,
      commission: 0,
    });

    const result = await coreService.createPaiement(
      {
        montant: 10000,
        methodePaiement: 'WAVE',
      },
      {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      },
    );

    expect(repository.createPaiement).toHaveBeenCalledWith(
      expect.objectContaining({
        utilisateur_id: 'user-1',
        montant: 10000,
        montant_escrow: 10000,
        commission: 0,
        is_escrow: false,
      }),
    );
    expect(paiementLogService.createLogAction).toHaveBeenCalledWith(
      'pay-1',
      'CREATION',
      'Paiement créé',
    );
    expect(result.montantEscrow).toBe('10000');
  });

  it('creates an escrow payment with reservation validation and commission', async () => {
    const reservation: ReservationRecord = {
      id: 'reservation-1',
      annonce_location: { proprietaire_id: 'owner-1' },
    };

    repository.findUserByEmail.mockResolvedValue(adminUser);
    repository.findUserById.mockResolvedValue(currentUser);
    repository.findReservationById.mockResolvedValue(reservation);
    repository.createPaiement.mockResolvedValue(paiementRecord);

    await coreService.createPaiement(
      {
        montant: 10000,
        methodePaiement: 'WAVE',
        utilisateurId: 'user-1',
        reservationId: 'reservation-1',
        isEscrow: true,
      },
      {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      },
    );

    expect(repository.createPaiement).toHaveBeenCalledWith(
      expect.objectContaining({
        utilisateur_id: 'user-1',
        reservation_id: 'reservation-1',
        commission: 500,
        montant_escrow: 9500,
        is_escrow: true,
      }),
    );
  });

  it('rejects payment creation when the reservation does not exist', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findUserById.mockResolvedValue(currentUser);
    repository.findReservationById.mockResolvedValue(null);

    await expect(
      coreService.createPaiement(
        {
          montant: 10000,
          methodePaiement: 'WAVE',
          reservationId: 'missing',
        },
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Réservation non trouvée');
  });

  it('confirms an escrow payment and blocks escrow funds', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findPaiementById.mockResolvedValue(paiementRecord);
    repository.updatePaiement.mockResolvedValue({
      ...paiementRecord,
      statut: 'CONFIRME',
      reference_externe: 'external-ref',
      date_paiement: new Date('2026-03-02T00:00:00.000Z'),
    });

    const result = await coreService.confirmerPaiement(
      'pay-1',
      ' external-ref ',
      {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      },
    );

    expect(repository.updatePaiement).toHaveBeenCalledWith(
      'pay-1',
      expect.objectContaining({
        statut: 'CONFIRME',
        reference_externe: 'external-ref',
      }),
    );
    expect(escrowService.bloquerFondsEscrow).toHaveBeenCalledWith(
      'user-1',
      9500,
      'ref-tx',
    );
    expect(result.referenceExterne).toBe('external-ref');
  });

  it('rejects invalid payment status filters', async () => {
    repository.findUserByEmail.mockResolvedValue(adminUser);

    await expect(
      coreService.getPaiementsByStatut('unknown', {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).rejects.toThrow('Statut de paiement invalide');
  });

  it('creates a Wave payment URL through the provider service', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findUserById.mockResolvedValue(currentUser);
    repository.createPaiement.mockResolvedValue({
      ...paiementRecord,
      is_escrow: false,
      montant_escrow: 10000,
      commission: 0,
    });
    repository.updatePaiement.mockResolvedValue({
      id: 'pay-1',
      utilisateurId: 'user-1',
      reservationId: 'reservation-1',
      montant: '10000',
      montantEscrow: '10000',
      commission: '0',
      statut: 'EN_ATTENTE',
      methodePaiement: 'WAVE',
      datePaiement: null,
      referenceTransaction: 'ref-tx',
      referenceExterne: null,
      urlPaiement: 'https://wave.test/pay/generate',
      isEscrow: false,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    } as never);

    const result = await providerService.createPaiementWave(
      {
        montant: 10000,
        methodePaiement: 'WAVE',
      },
      {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      },
    );

    expect(repository.updatePaiement).toHaveBeenCalledWith(
      'pay-1',
      expect.objectContaining({
        url_paiement: expect.stringContaining('https://wave.test/pay/'),
      }),
    );
    expect(result.urlPaiement).toBe('https://wave.test/pay/generate');
  });

  it('processes webhook payload objects and rejects invalid signatures', async () => {
    webhookService.processWebhook.mockResolvedValueOnce('OK');
    await expect(
      providerService.processWaveWebhookFromPayload({ id: 'x' }, 'sig'),
    ).resolves.toBe('OK');

    expect(webhookService.processWebhook).toHaveBeenCalledWith(
      JSON.stringify({ id: 'x' }),
      'sig',
      'wave-secret',
      'WAVE',
    );

    webhookService.processWebhook.mockResolvedValueOnce('INVALID_SIGNATURE');

    await expect(
      providerService.processOrangeMoneyWebhook('payload', 'sig'),
    ).rejects.toThrow('Signature webhook invalide');
  });

  it('rejects escrow release when reference is missing or already released', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findPaiementById.mockResolvedValueOnce({
      ...paiementRecord,
      statut: 'CONFIRME',
      reference_transaction: null,
    });

    await expect(
      providerService.confirmerReceptionEtLiberer('pay-1', {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Référence transaction manquante');

    repository.findPaiementById.mockResolvedValueOnce({
      ...paiementRecord,
      statut: 'CONFIRME',
      reference_transaction: 'ref-tx',
    });
    repository.hasEscrowReleaseTransaction.mockResolvedValue(true);

    await expect(
      providerService.confirmerReceptionEtLiberer('pay-1', {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Fonds escrow déjà libérés');
  });
});
