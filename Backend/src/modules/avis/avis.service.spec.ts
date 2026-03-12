import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { AvisRepositoryPort } from './avis.repository.port';
import { AVIS_REPOSITORY_PORT } from './avis.repository.port';
import { AvisService } from './avis.service';
import { AvisMapper } from './services/avis.mapper';
import { AvisInputValidator } from './validation/avis-input.validator';

describe('AvisService', () => {
  let service: AvisService;
  let repository: jest.Mocked<AvisRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvisService,
        AvisInputValidator,
        AvisMapper,
        {
          provide: AVIS_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            findVehiculeById: jest.fn(),
            findGarageById: jest.fn(),
            createAvis: jest.fn(),
            findAvisById: jest.fn(),
            findAvisByUtilisateurPaged: jest.fn(),
            findAvisByVehiculePaged: jest.fn(),
            findAvisByGaragePaged: jest.fn(),
            getNoteMoyenneUtilisateur: jest.fn(),
            getNoteMoyenneVehicule: jest.fn(),
            getNoteMoyenneGarage: jest.fn(),
            existsByTransactionAndAuteur: jest.fn(),
            findByTransactionId: jest.fn(),
            updateAvisStatut: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<AvisService>(AvisService);
    repository = module.get(AVIS_REPOSITORY_PORT);
  });

  it('should reject creating a second avis for same transaction and author', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'Nom',
      prenom: 'Prenom',
    } as never);

    repository.existsByTransactionAndAuteur.mockResolvedValue(true);

    await expect(
      service.createAvis(
        {
          typeAvis: 'ACHAT_VEHICULE',
          transactionId: '00000000-0000-0000-0000-000000000010',
          note: 5,
          commentaire: 'Top',
          vehiculeId: '00000000-0000-0000-0000-000000000020',
        },
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Un avis existe déjà pour cette transaction');
  });

  it('should reject avis creation when garage target does not exist', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'Nom',
      prenom: 'Prenom',
    } as never);
    repository.existsByTransactionAndAuteur.mockResolvedValue(false);
    repository.findGarageById.mockResolvedValue(null);

    await expect(
      service.createAvis(
        {
          typeAvis: 'SERVICE_GARAGE',
          transactionId: '00000000-0000-0000-0000-000000000010',
          note: 4,
          commentaire: 'Correct',
          garageId: '00000000-0000-0000-0000-000000000030',
        },
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Garage non trouvé');
  });

  it('should cap page size to 100', async () => {
    repository.findAvisByGaragePaged.mockResolvedValue({
      items: [],
      total: 0,
    } as never);

    await service.getAvisByGarage('00000000-0000-0000-0000-000000000030', 0, 500);

    expect(repository.findAvisByGaragePaged).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000030',
      'PUBLIE',
      0,
      100,
    );
  });
});
