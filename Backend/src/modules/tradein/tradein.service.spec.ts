import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TradeInEstimationService } from './services/tradein-estimation.service';
import { TradeInSecurityService } from './services/tradein-security.service';
import { TradeInWorkflowService } from './services/tradein-workflow.service';
import { TradeInMapper } from './services/tradein.mapper';
import type { TradeInRepositoryPort } from './tradein.repository.port';
import { TRADEIN_REPOSITORY_PORT } from './tradein.repository.port';
import { TradeInService } from './tradein.service';
import { TradeInStatusValidator } from './validation/tradein-status.validator';

describe('TradeInService', () => {
  let service: TradeInService;
  let repository: jest.Mocked<TradeInRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeInService,
        TradeInSecurityService,
        TradeInWorkflowService,
        TradeInEstimationService,
        TradeInMapper,
        TradeInStatusValidator,
        {
          provide: TRADEIN_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            findVehiculeById: jest.fn(),
            createDemande: jest.fn(),
            findDemandeById: jest.fn(),
            findDemandesPaged: jest.fn(),
            findDemandesByUtilisateurId: jest.fn(),
            findDemandesByNotifie: jest.fn(),
            updateDemande: jest.fn(),
            deleteDemande: jest.fn(),
            createHistoriqueEstimation: jest.fn(),
            createNotification: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<TradeInService>(TradeInService);
    repository = module.get(TRADEIN_REPOSITORY_PORT);
  });

  it('should reject listing demandes for non-admin role', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'u@test.com',
      nom: 'User',
      prenom: 'Test',
      typeUtilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.getAllDemandes(0, 10, {
        userId: 'user-1',
        email: 'u@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject create demande when desired vehicle equals current vehicle', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'u@test.com',
      nom: 'User',
      prenom: 'Test',
      typeUtilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findVehiculeById.mockResolvedValue({
      id: 'veh-1',
      anneeFabrication: 2020,
      prixVente: 10000000,
      marque: { nom: 'Toyota' },
      modele: { nom: 'Corolla' },
    } as never);

    await expect(
      service.createDemande(
        {
          vehiculeActuelId: 'veh-1',
          vehiculeSouhaiteId: 'veh-1',
          kilometrageActuel: 120000,
          etatVehicule: 'bon',
        },
        {
          userId: 'user-1',
          email: 'u@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Le véhicule souhaité doit être différent du véhicule actuel');
  });

  it('should reject auto estimation when demande is in final status', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      nom: 'Admin',
      prenom: 'Test',
      typeUtilisateur: { nom: 'ADMIN' },
    } as never);
    repository.findDemandeById.mockResolvedValue({
      id: 'demande-1',
      utilisateurId: 'user-2',
      vehiculeActuelId: 'veh-1',
      vehiculeSouhaiteId: null,
      statut: 'ACCEPTE',
      prixEstime: null,
      prixPropose: null,
      kilometrageActuel: 50000,
      etatVehicule: 'bon',
      dateSoumission: new Date(),
      dateTraitement: null,
      dateEvaluation: null,
      motifRejet: null,
      commentaireAdmin: null,
      estNotifie: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      utilisateur: { id: 'user-2', nom: 'User' },
      vehiculeActuel: {
        id: 'veh-1',
        anneeFabrication: 2021,
        prixVente: 15000000,
        marque: { nom: 'Renault' },
        modele: { nom: 'Clio' },
      },
      vehiculeSouhaite: null,
    } as never);

    await expect(
      service.calculerEstimationAuto('demande-1', {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).rejects.toThrow('Impossible de modifier une demande au statut final ACCEPTE');
  });
});
