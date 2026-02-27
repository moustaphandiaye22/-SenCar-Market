import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { AbonnementRepositoryPort } from './abonnement.repository.port';
import { ABONNEMENT_REPOSITORY_PORT } from './abonnement.repository.port';
import { AbonnementService } from './abonnement.service';
import { AbonnementAccessPolicy } from './services/abonnement-access.policy';
import { AbonnementMapper } from './services/abonnement.mapper';
import { AbonnementInputValidator } from './validation/abonnement-input.validator';

describe('AbonnementService', () => {
  let service: AbonnementService;
  let repository: jest.Mocked<AbonnementRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbonnementService,
        AbonnementInputValidator,
        AbonnementAccessPolicy,
        AbonnementMapper,
        {
          provide: ABONNEMENT_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            createAbonnement: jest.fn(),
            updateAbonnement: jest.fn(),
            findAbonnementById: jest.fn(),
            findAllAbonnements: jest.fn(),
            createUtilisateurAbonnement: jest.fn(),
            updateUtilisateurAbonnement: jest.fn(),
            findActiveSubscription: jest.fn(),
            findPendingSubscription: jest.fn(),
            findSubscriptionsByUtilisateurPaged: jest.fn(),
            findExpiredActiveSubscriptions: jest.fn(),
            findExpiringSoon: jest.fn(),
            createBoost: jest.fn(),
            updateBoost: jest.fn(),
            deleteBoost: jest.fn(),
            findBoostById: jest.fn(),
            findBoostsByAnnonceLocationId: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<AbonnementService>(AbonnementService);
    repository = module.get(ABONNEMENT_REPOSITORY_PORT);
  });

  it('should refuse plan creation for non-admin', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);

    await expect(
      service.createPlan(
        {
          nom: 'Premium',
          prixMensuel: 10000,
          dureeJours: 30,
          nombreAnnonces: 5,
        },
        { userId: 'user-1', email: 'a@test.com', typeUtilisateur: 'ACHETEUR' },
      ),
    ).rejects.toThrow('Accès refusé');
  });

  it('should cap subscriptions history size to 100', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);
    repository.findSubscriptionsByUtilisateurPaged.mockResolvedValue({
      items: [],
      total: 0,
    } as never);

    await service.getSubscriptionsHistory(
      'user-1',
      0,
      500,
      { userId: 'user-1', email: 'a@test.com', typeUtilisateur: 'ACHETEUR' },
    );

    expect(repository.findSubscriptionsByUtilisateurPaged).toHaveBeenCalledWith('user-1', 0, 100);
  });

  it('should reject boost creation for non-admin role', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);

    await expect(
      service.createBoost(
        {
          annonceLocationId: '00000000-0000-0000-0000-000000000010',
          dateDebut: '2026-03-01T00:00:00.000Z',
          dateFin: '2026-03-10T00:00:00.000Z',
          niveauBoost: 'STANDARD',
        },
        { userId: 'user-1', email: 'a@test.com', typeUtilisateur: 'ACHETEUR' },
      ),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject boost update with invalid dates', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      typeUtilisateur: { nom: 'ADMIN' },
    } as never);

    await expect(
      service.updateBoost(
        '00000000-0000-0000-0000-000000000020',
        {
          annonceLocationId: '00000000-0000-0000-0000-000000000010',
          dateDebut: '2026-03-10T00:00:00.000Z',
          dateFin: '2026-03-01T00:00:00.000Z',
          niveauBoost: 'STANDARD',
        },
        { userId: 'admin-1', email: 'admin@test.com', typeUtilisateur: 'ADMIN' },
      ),
    ).rejects.toThrow('Dates de boost invalides');
  });
});
