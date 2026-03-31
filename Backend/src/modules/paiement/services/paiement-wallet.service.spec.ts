import type {
  PortefeuilleRecord,
  TransactionRecord,
  UserRecord,
} from '../paiement.models';
import type { PaiementRepositoryPort } from '../paiement.repository.port';

import type { PaiementLogService } from './paiement-log.service';
import { PaiementWalletService } from './paiement-wallet.service';

describe('PaiementWalletService', () => {
  let repository: jest.Mocked<PaiementRepositoryPort>;
  let paiementLogService: jest.Mocked<PaiementLogService>;
  let service: PaiementWalletService;

  const user: UserRecord = {
    id: 'user-1',
    email: 'user@test.com',
    type_utilisateur: { nom: 'UTILISATEUR' },
  };

  const portefeuille: PortefeuilleRecord = {
    id: 'wallet-1',
    utilisateur_id: 'user-1',
    solde: 1000,
    solde_bloque: 100,
    date_derniere_recharge: null,
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    updated_at: new Date('2026-03-01T00:00:00.000Z'),
  };

  const transaction: TransactionRecord = {
    id: 'tx-1',
    portefeuille_id: 'wallet-1',
    montant: 100,
    type_transaction: 'RETRAIT',
    statut: 'EN_ATTENTE',
    description: 'Retrait vers 770000000',
    reference_externe: null,
    date_transaction: new Date('2026-03-02T00:00:00.000Z'),
    created_at: new Date('2026-03-02T00:00:00.000Z'),
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
      newId: jest.fn().mockReturnValue('generated-id'),
    } as unknown as jest.Mocked<PaiementRepositoryPort>;

    paiementLogService = {
      createLogAction: jest.fn(),
    } as unknown as jest.Mocked<PaiementLogService>;

    service = new PaiementWalletService(repository, paiementLogService);
  });

  it('returns the existing wallet when present', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(portefeuille);

    await expect(
      service.getOrCreatePortefeuilleEntity('user-1'),
    ).resolves.toEqual(portefeuille);

    expect(repository.createPortefeuille).not.toHaveBeenCalled();
  });

  it('creates a wallet when none exists yet', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(null);
    repository.findUserById.mockResolvedValue(user);
    repository.createPortefeuille.mockResolvedValue({
      ...portefeuille,
      solde: 0,
      solde_bloque: 0,
    });

    const result = await service.getOrCreatePortefeuilleEntity('user-1');

    expect(repository.createPortefeuille).toHaveBeenCalledWith({
      id: 'generated-id',
      utilisateur_id: 'user-1',
      solde: 0,
      solde_bloque: 0,
      is_actif: true,
    });
    expect(result.solde).toBe(0);
  });

  it('rejects wallet creation when the user does not exist', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(null);
    repository.findUserById.mockResolvedValue(null);

    await expect(
      service.getOrCreatePortefeuilleEntity('missing-user'),
    ).rejects.toThrow('Utilisateur non trouvé');
  });

  it('credits the wallet and logs the operation', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(portefeuille);
    repository.createTransaction.mockResolvedValue({
      ...transaction,
      type_transaction: 'CREDIT',
      statut: 'CONFIRMEE',
      montant: 250,
    });
    repository.updatePortefeuille.mockResolvedValue({
      ...portefeuille,
      solde: 1250,
    });

    const result = await service.crediterPortefeuille(
      {
        montant: 250,
        typeTransaction: 'CREDIT',
        description: 'Recharge',
        referencePaiement: 'pay-ref',
      },
      'user-1',
    );

    expect(repository.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        portefeuille_id: 'wallet-1',
        montant: 250,
        type_transaction: 'CREDIT',
      }),
    );
    expect(repository.updatePortefeuille).toHaveBeenCalledWith(
      'wallet-1',
      expect.objectContaining({
        solde: 1250,
      }),
    );
    expect(paiementLogService.createLogAction).toHaveBeenCalledWith(
      null,
      'CREDIT',
      'Crédit de 250 - Recharge',
    );
    expect(result.solde).toBe(1250);
  });

  it('rejects wallet debit when available balance is insufficient', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(portefeuille);

    await expect(
      service.debiterPortefeuille(
        {
          montant: 950,
          typeTransaction: 'DEBIT',
          description: 'Achat',
        },
        'user-1',
      ),
    ).rejects.toThrow('Solde insuffisant');
  });

  it('debits the wallet when balance is sufficient', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(portefeuille);
    repository.createTransaction.mockResolvedValue({
      ...transaction,
      type_transaction: 'DEBIT',
      statut: 'CONFIRMEE',
      montant: 300,
    });
    repository.updatePortefeuille.mockResolvedValue({
      ...portefeuille,
      solde: 700,
    });

    const result = await service.debiterPortefeuille(
      {
        montant: 300,
        typeTransaction: 'DEBIT',
        description: 'Achat',
      },
      'user-1',
    );

    expect(repository.updatePortefeuille).toHaveBeenCalledWith(
      'wallet-1',
      expect.objectContaining({
        solde: 700,
      }),
    );
    expect(result.solde).toBe(700);
  });

  it('creates a withdrawal request and blocks funds', async () => {
    repository.findPortefeuilleByUtilisateurId.mockResolvedValue(portefeuille);
    repository.createTransaction.mockResolvedValue(transaction);
    repository.updatePortefeuille.mockResolvedValue({
      ...portefeuille,
      solde_bloque: 250,
    });

    const result = await service.demanderRetrait(
      {
        montant: 150,
        telephone: '770000000',
        nomBeneficiaire: 'Client',
      },
      'user-1',
    );

    expect(repository.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type_transaction: 'RETRAIT',
        statut: 'EN_ATTENTE',
      }),
    );
    expect(repository.updatePortefeuille).toHaveBeenCalledWith(
      'wallet-1',
      expect.objectContaining({
        solde_bloque: 250,
      }),
    );
    expect(result.id).toBe('tx-1');
  });

  it('detects whether a wallet has sufficient available balance', () => {
    expect(service.hasSufficientAvailableBalance(portefeuille, 900)).toBe(true);
    expect(service.hasSufficientAvailableBalance(portefeuille, 901)).toBe(false);
  });
});
