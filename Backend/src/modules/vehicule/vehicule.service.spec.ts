import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { VehiculeAccessPolicy } from './services/vehicule-access.policy';
import { VehiculeMapper } from './services/vehicule.mapper';
import { VehiculeInputValidator } from './validation/vehicule-input.validator';
import { VEHICULE_REPOSITORY_PORT } from './vehicule.repository.port';
import type { VehiculeRepositoryPort } from './vehicule.repository.port';
import { VehiculeService } from './vehicule.service';

describe('VehiculeService', () => {
  let service: VehiculeService;
  let repository: jest.Mocked<VehiculeRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculeService,
        VehiculeInputValidator,
        VehiculeAccessPolicy,
        VehiculeMapper,
        {
          provide: VEHICULE_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findVehiculeById: jest.fn(),
            findMarqueById: jest.fn(),
            findModeleById: jest.fn(),
            findCarburantById: jest.fn(),
            findBoiteVitesseById: jest.fn(),
            createVehicule: jest.fn(),
            createPhoto: jest.fn(),
            findPublishedPaged: jest.fn(),
            findByProprietaireId: jest.fn(),
            updateVehicule: jest.fn(),
            deleteVehicule: jest.fn(),
            existsFavori: jest.fn(),
            createFavori: jest.fn(),
            deleteFavori: jest.fn(),
            findFavorisByUtilisateur: jest.fn(),
            isFavori: jest.fn(),
            countFavoris: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehiculeService>(VehiculeService);
    repository = module.get(VEHICULE_REPOSITORY_PORT);
  });

  it('should forbid create for non vendeur/concessionnaire roles', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      typeUtilisateur: { nom: 'EXPERT' },
    } as never);

    await expect(
      service.createVehicule(
        {
          marqueId: '00000000-0000-0000-0000-000000000001',
          modeleId: '00000000-0000-0000-0000-000000000002',
          anneeFabrication: 2022,
          kilometrage: 1000,
          carburantId: '00000000-0000-0000-0000-000000000003',
          boiteVitesseId: '00000000-0000-0000-0000-000000000004',
          couleur: 'Noir',
          prixVente: 10000000,
          numeroVin: 'VIN123',
        },
        { userId: 'user-1', email: 'u@test.com', typeUtilisateur: null },
      ),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject vehicle creation with blank photo url', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      typeUtilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.createVehicule(
        {
          marqueId: '00000000-0000-0000-0000-000000000001',
          modeleId: '00000000-0000-0000-0000-000000000002',
          anneeFabrication: 2022,
          kilometrage: 1000,
          carburantId: '00000000-0000-0000-0000-000000000003',
          boiteVitesseId: '00000000-0000-0000-0000-000000000004',
          couleur: 'Noir',
          prixVente: 10000000,
          numeroVin: 'VIN123',
          photosUrls: ['https://ok.test/p1.jpg', '   '],
        },
        { userId: 'user-1', email: 'u@test.com', typeUtilisateur: null },
      ),
    ).rejects.toThrow('Une URL de photo est invalide');
  });

  it('should forbid reading non published vehicle for non owner non admin', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-2',
      typeUtilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findVehiculeById.mockResolvedValue({
      id: 'veh-1',
      proprietaireId: 'user-1',
      statut: 'BROUILLON',
    } as never);

    await expect(
      service.getVehiculeById('veh-1', {
        userId: 'user-2',
        email: 'buyer@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Accès refusé');
  });

  it('should allow owner reading non published vehicle and increment views', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      typeUtilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findVehiculeById.mockResolvedValue({
      id: 'veh-1',
      proprietaireId: 'user-1',
      statut: 'BROUILLON',
      vues: 10,
      marque: { nom: 'Toyota' },
      modele: { nom: 'Yaris' },
      carburant: { nom: 'Essence' },
      boiteVitesse: { nom: 'Auto' },
      proprietaire: { id: 'user-1', nom: 'Owner' },
      photos: [],
      anneeFabrication: 2022,
      kilometrage: 1000,
      couleur: 'Noir',
      prixVente: 10000000,
      description: null,
      numeroVin: 'VIN123',
      immatriculation: null,
      prixNegociable: false,
      certifie: false,
      estBoost: false,
      boostDebut: null,
      boostFin: null,
      nombreFavoris: 0,
      createdAt: new Date(),
    } as never);
    repository.updateVehicule.mockResolvedValue({} as never);
    repository.isFavori.mockResolvedValue(null);

    const result = await service.getVehiculeById('veh-1', {
      userId: 'user-1',
      email: 'seller@test.com',
      typeUtilisateur: 'UTILISATEUR',
    });

    expect(repository.updateVehicule).toHaveBeenCalledWith('veh-1', { vues: 11 });
    expect(result.vues).toBe(11);
  });
});
