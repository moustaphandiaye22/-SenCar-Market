import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { GarageRepositoryPort } from './garage.repository.port';
import { GARAGE_REPOSITORY_PORT } from './garage.repository.port';
import { GarageService } from './garage.service';
import { GarageAccessPolicy } from './services/garage-access.policy';
import { GarageMapper } from './services/garage.mapper';
import { GarageInputValidator } from './validation/garage-input.validator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('GarageService', () => {
  let service: GarageService;
  let repository: jest.Mocked<GarageRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GarageService,
        GarageInputValidator,
        GarageAccessPolicy,
        GarageMapper,
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: GARAGE_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            createGarage: jest.fn(),
            updateGarage: jest.fn(),
            findGarageById: jest.fn(),
            deleteGarage: jest.fn(),
            findGaragesPaged: jest.fn(),
            findGaragesByStatutPaged: jest.fn(),
            findGaragesByProprietaireId: jest.fn(),
            findActiveByVille: jest.fn(),
            findByLocation: jest.fn(),
            searchGarages: jest.fn(),
            createService: jest.fn(),
            findServiceById: jest.fn(),
            findServicesActifs: jest.fn(),
            findAssociationByGarageAndService: jest.fn(),
            createAssociation: jest.fn(),
            findServicesByGarageId: jest.fn(),
            findAssociationsByGarageId: jest.fn(),
            deleteAssociation: jest.fn(),
            deleteManyAssociations: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<GarageService>(GarageService);
    repository = module.get(GARAGE_REPOSITORY_PORT);
  });

  it('should reject create garage for unauthorized role', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      nom: 'User',
      prenom: 'Test',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.createGarage(
        {
          nom: 'Garage Test',
          adresse: 'Dakar',
          telephone: '770000000',
          ville: 'Dakar',
        },
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject proximity search with invalid radius', async () => {
    await expect(service.searchByProximity(14.7, -17.4, 0)).rejects.toThrow('Rayon de recherche invalide');
  });

  it('should reject associating inactive service', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'garage@test.com',
      nom: 'Garage',
      prenom: 'Owner',
      typeUtilisateur: { nom: 'PROFESSIONNEL' },
    } as never);
    repository.findGarageById.mockResolvedValue({
      id: 'garage-1',
      nom: 'Garage Test',
      adresse: 'Dakar',
      telephone: '770000000',
      email: null,
      description: null,
      horaires_ouverture: null,
      latitude: null,
      longitude: null,
      ville: 'Dakar',
      pays: null,
      logo_url: null,
      statut_validation: 'ACTIF',
      commentaire_admin: null,
      date_validation: null,
      utilisateur_id: 'user-1',
      created_at: new Date(),
      updated_at: new Date(),
      utilisateur: { id: 'user-1', nom: 'Owner' },
    } as never);
    repository.findServiceById.mockResolvedValue({
      id: 'service-1',
      nom: 'Vidange',
      description: null,
      prix: 10000,
      duree_estimee: 60,
      categorie: 'ENTRETIEN',
      actif: false,
      created_at: new Date(),
      updated_at: new Date(),
    } as never);

    await expect(
      service.associateService(
        'garage-1',
        { serviceId: 'service-1' },
        { userId: 'user-1', email: 'garage@test.com', typeUtilisateur: 'PROFESSIONNEL' },
      ),
    ).rejects.toThrow('Service inactif');
  });

  it('should reject blank logo url update', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'garage@test.com',
      nom: 'Garage',
      prenom: 'Owner',
      typeUtilisateur: { nom: 'PROFESSIONNEL' },
    } as never);
    repository.findGarageById.mockResolvedValue({
      id: 'garage-1',
      nom: 'Garage Test',
      adresse: 'Dakar',
      telephone: '770000000',
      email: null,
      description: null,
      horaires_ouverture: null,
      latitude: null,
      longitude: null,
      ville: 'Dakar',
      pays: null,
      logo_url: null,
      statut_validation: 'ACTIF',
      commentaire_admin: null,
      date_validation: null,
      utilisateur_id: 'user-1',
      created_at: new Date(),
      updated_at: new Date(),
      utilisateur: { id: 'user-1', nom: 'Owner' },
    } as never);

    await expect(
      service.updateLogo(
        'garage-1',
        '   ',
        { userId: 'user-1', email: 'garage@test.com', typeUtilisateur: 'PROFESSIONNEL' },
      ),
    ).rejects.toThrow('Champ requis invalide: logoUrl');
  });
});
