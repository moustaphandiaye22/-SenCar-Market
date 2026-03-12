import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { AdminRepositoryPort } from './admin.repository.port';
import { ADMIN_REPOSITORY_PORT } from './admin.repository.port';
import { AdminService } from './admin.service';
import { AdminAccessPolicy } from './services/admin-access.policy';
import { AdminMapper } from './services/admin.mapper';
import { AdminInputValidator } from './validation/admin-input.validator';

describe('AdminService', () => {
  let service: AdminService;
  let repository: jest.Mocked<AdminRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        AdminInputValidator,
        AdminAccessPolicy,
        AdminMapper,
        {
          provide: ADMIN_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findTypeUtilisateurByNom: jest.fn(),
            findUsersPaged: jest.fn(),
            findUserById: jest.fn(),
            updateUser: jest.fn(),
            findVehiculesPaged: jest.fn(),
            findVehiculeById: jest.fn(),
            updateVehicule: jest.fn(),
            deleteVehicule: jest.fn(),
            findTransactionsPaged: jest.fn(),
            findTransactionsByUtilisateurId: jest.fn(),
            findTransactionById: jest.fn(),
            createTransaction: jest.fn(),
            countUtilisateurs: jest.fn(),
            countVehicules: jest.fn(),
            countVehiculesByStatut: jest.fn(),
            countReservations: jest.fn(),
            countReservationsByStatut: jest.fn(),
            countTransactions: jest.fn(),
            countTransactionsByStatut: jest.fn(),
            countAbonnements: jest.fn(),
            countAbonnementsActifs: jest.fn(),
            findTransactionsByStatut: jest.fn(),
            createNotification: jest.fn(),
            findAllUsersIds: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repository = module.get(ADMIN_REPOSITORY_PORT);
  });

  it('should refuse non-admin access', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      typeUtilisateur: { id: 'role-1', nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.getDashboardStats({
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject suspendreUtilisateur when reason is blank', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      typeUtilisateur: { id: 'role-admin', nom: 'ADMIN' },
    } as never);

    await expect(
      service.suspendreUtilisateur(
        '00000000-0000-4000-8000-000000000001',
        '   ',
        {
          userId: 'admin-1',
          email: 'admin@test.com',
          typeUtilisateur: 'ADMIN',
        },
      ),
    ).rejects.toThrow('Raison requise');
  });

  it('should normalize comma-separated utilisateurIds for group notifications', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      typeUtilisateur: { id: 'role-admin', nom: 'ADMIN' },
    } as never);
    repository.createNotification.mockResolvedValue({ id: 'notif-1' } as never);

    await service.notifierGroupeUtilisateurs(
      '00000000-0000-4000-8000-000000000001, 00000000-0000-4000-8000-000000000002',
      'Info',
      'Message test',
      {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      },
    );

    expect(repository.createNotification).toHaveBeenCalledTimes(2);
  });
});
