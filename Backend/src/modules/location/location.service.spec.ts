import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { LocationRepositoryPort } from './location.repository.port';
import { LOCATION_REPOSITORY_PORT } from './location.repository.port';
import { LocationService } from './location.service';
import { LocationAccessPolicy } from './services/location-access.policy';
import { LocationMapper } from './services/location.mapper';
import { LocationInputValidator } from './validation/location-input.validator';

describe('LocationService', () => {
  let service: LocationService;
  let repository: jest.Mocked<LocationRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        LocationInputValidator,
        LocationAccessPolicy,
        LocationMapper,
        {
          provide: LOCATION_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findVehiculeById: jest.fn(),
            createAnnonce: jest.fn(),
            findAnnonceById: jest.fn(),
            findAnnoncesAll: jest.fn(),
            findAnnoncesByProprietaireId: jest.fn(),
            updateAnnonce: jest.fn(),
            deleteAnnonce: jest.fn(),
            createReservation: jest.fn(),
            findReservationById: jest.fn(),
            findReservationsByAnnonceLocationId: jest.fn(),
            findReservationsByLocataireId: jest.fn(),
            updateReservation: jest.fn(),
            createDisponibilite: jest.fn(),
            findDisponibilitesByAnnonceId: jest.fn(),
            deleteDisponibilitesByAnnonceId: jest.fn(),
            createHistorique: jest.fn(),
            findHistoriqueByReservationId: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    repository = module.get(LOCATION_REPOSITORY_PORT);
  });

  it('should refuse annonce creation for unauthorized role', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      prenom: 'A',
      nom: 'B',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);

    await expect(
      service.createAnnonceLocation(
        {
          vehiculeId: '11111111-1111-1111-1111-111111111111',
          tarifJournalier: 10000,
        },
        { userId: 'user-1', email: 'a@test.com', typeUtilisateur: null },
      ),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject reservation creation when annonce is inactive', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      prenom: 'A',
      nom: 'B',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);
    repository.findAnnonceById.mockResolvedValue({
      id: 'ann-1',
      proprietaireId: 'owner-1',
      actif: false,
      tarifJournalier: 10000,
      annonceLocation: {},
      proprietaire: { id: 'owner-1', email: 'owner@test.com', prenom: 'O', nom: 'W', typeUtilisateur: { nom: 'PROPRIETAIRE_LOUEUR' } },
    } as never);

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const afterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    await expect(
      service.createReservation(
        {
          annonceLocationId: 'ann-1',
          dateDebut: tomorrow.toISOString(),
          dateFin: afterTomorrow.toISOString(),
        },
        { userId: 'user-1', email: 'a@test.com', typeUtilisateur: 'ACHETEUR' },
      ),
    ).rejects.toThrow('Annonce de location inactive');
  });

  it('should reject invalid disponibilite date', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'owner-1',
      email: 'owner@test.com',
      prenom: 'Owner',
      nom: 'Test',
      typeUtilisateur: { nom: 'ADMIN' },
    } as never);
    repository.findAnnonceById.mockResolvedValue({
      id: 'ann-1',
      proprietaireId: 'owner-1',
      actif: true,
      proprietaire: { id: 'owner-1', email: 'owner@test.com', prenom: 'Owner', nom: 'Test', typeUtilisateur: { nom: 'ADMIN' } },
    } as never);

    await expect(
      service.ajouterDisponibilites(
        'ann-1',
        [{ dates: ['not-a-date'] }],
        { userId: 'owner-1', email: 'owner@test.com', typeUtilisateur: 'ADMIN' },
      ),
    ).rejects.toThrow('Date de disponibilité invalide');
  });
});
