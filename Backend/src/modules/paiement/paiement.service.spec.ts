import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { PaiementRepositoryPort } from './paiement.repository.port';
import { PAIEMENT_REPOSITORY_PORT } from './paiement.repository.port';
import { PaiementService } from './paiement.service';
import { PaiementEscrowService } from './services/paiement-escrow.service';
import { PaiementLogService } from './services/paiement-log.service';
import { PaiementWalletService } from './services/paiement-wallet.service';
import { PaiementWebhookService } from './services/paiement-webhook.service';
import { PaiementAmountValidator } from './validation/paiement-amount.validator';

describe('PaiementService', () => {
  let service: PaiementService;
  let repository: jest.Mocked<PaiementRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaiementService,
        PaiementWebhookService,
        PaiementWalletService,
        PaiementEscrowService,
        PaiementLogService,
        PaiementAmountValidator,
        {
          provide: PAIEMENT_REPOSITORY_PORT,
          useValue: {
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
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback: string) => fallback),
          },
        },
      ],
    }).compile();

    service = module.get<PaiementService>(PaiementService);
    repository = module.get(PAIEMENT_REPOSITORY_PORT);
  });

  it('should refuse payment read when not owner and not admin', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    repository.findPaiementById.mockResolvedValue({
      id: 'pay-1',
      utilisateur_id: 'user-2',
    } as never);

    await expect(
      service.getPaiementById('pay-1', {
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject confirmerPaiement when referenceExterne is blank', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findPaiementById.mockResolvedValue({
      id: 'pay-1',
      utilisateur_id: 'user-1',
    } as never);

    await expect(
      service.confirmerPaiement(
        'pay-1',
        '   ',
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Référence externe requise');
  });

  it('should reject remboursementPaiement when amount is negative', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      type_utilisateur: { nom: 'ADMIN' },
    } as never);

    await expect(
      service.remboursementPaiement(
        'pay-1',
        -1,
        {
          userId: 'admin-1',
          email: 'admin@test.com',
          typeUtilisateur: 'ADMIN',
        },
      ),
    ).rejects.toThrow('Montant de remboursement invalide');
  });

  it('should reject commission calculation when amount is not finite', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      type_utilisateur: { nom: 'ADMIN' },
    } as never);

    await expect(
      service.calculateCommissionForUser(
        Number.NaN,
        {
          userId: 'admin-1',
          email: 'admin@test.com',
          typeUtilisateur: 'ADMIN',
        },
      ),
    ).rejects.toThrow('Montant invalide');
  });

  it('should reject escrow release when payment is not escrow', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findPaiementById.mockResolvedValue({
      id: 'pay-1',
      utilisateur_id: 'user-1',
      is_escrow: false,
      statut: 'CONFIRME',
      reference_transaction: 'ref-1',
      reservation: { annonce_location: { proprietaire_id: 'owner-1' } },
    } as never);

    await expect(
      service.confirmerReceptionEtLiberer(
        'pay-1',
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Libération possible uniquement pour un paiement escrow');
  });

  it('should reject escrow release when already released', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findPaiementById.mockResolvedValue({
      id: 'pay-1',
      utilisateur_id: 'user-1',
      is_escrow: true,
      statut: 'CONFIRME',
      reference_transaction: 'ref-1',
      montant_escrow: 10000,
      reservation: { annonce_location: { proprietaire_id: 'owner-1' } },
    } as never);
    repository.hasEscrowReleaseTransaction.mockResolvedValue(true);

    await expect(
      service.confirmerReceptionEtLiberer(
        'pay-1',
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Fonds escrow déjà libérés');
  });
});
