import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { NotificationRepositoryPort } from './notification.repository.port';
import { NOTIFICATION_REPOSITORY_PORT } from './notification.repository.port';
import { NotificationService } from './notification.service';
import { NotificationAccessPolicy } from './services/notification-access.policy';
import { NotificationMapper } from './services/notification.mapper';
import { NotificationInputValidator } from './validation/notification-input.validator';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: jest.Mocked<NotificationRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        NotificationInputValidator,
        NotificationAccessPolicy,
        NotificationMapper,
        {
          provide: NOTIFICATION_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            createNotification: jest.fn(),
            updateNotification: jest.fn(),
            findNotificationById: jest.fn(),
            findNotificationsByUtilisateurPaged: jest.fn(),
            findUnreadNotificationsByUtilisateurPaged: jest.fn(),
            findNotificationsByTypePaged: jest.fn(),
            findUnreadNotificationsByUtilisateur: jest.fn(),
            countUnreadByUtilisateur: jest.fn(),
            deleteNotification: jest.fn(),
            deleteAllNotifications: jest.fn(),
            createSignalement: jest.fn(),
            updateSignalement: jest.fn(),
            findSignalementById: jest.fn(),
            findSignalementsPaged: jest.fn(),
            findSignalementsByStatutPaged: jest.fn(),
            findSignalementsByTypePaged: jest.fn(),
            countPendingSignalements: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get(NOTIFICATION_REPOSITORY_PORT);
  });

  it('should refuse notification read for foreign user', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);

    repository.findNotificationById.mockResolvedValue({
      id: 'notif-1',
      utilisateurId: 'user-2',
    } as never);

    await expect(
      service.getNotificationById('notif-1', {
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'ACHETEUR',
      }),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject createSignalement when description is blank', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);

    await expect(
      service.createSignalement(
        {
          typeEntite: 'ANNONCE',
          entiteId: '00000000-0000-4000-8000-000000000010',
          motif: 'SPAM',
          description: '   ',
        },
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'ACHETEUR',
        },
      ),
    ).rejects.toThrow('Description requise');
  });

  it('should set statut TRAITE when actionAdmin has no resolved keyword', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      nom: 'Admin',
      prenom: 'A',
      typeUtilisateur: { nom: 'ADMIN' },
    } as never);
    repository.findSignalementById.mockResolvedValue({
      id: 'sig-1',
      utilisateurId: 'user-2',
      typeEntite: 'ANNONCE',
      entiteId: '00000000-0000-4000-8000-000000000011',
      motif: 'SPAM',
      description: 'desc',
      statutTraitement: 'EN_ATTENTE',
      adminId: null,
      dateTraitement: null,
      dateSignalement: new Date(),
      utilisateur: { nom: 'User', prenom: 'U' },
    } as never);
    repository.updateSignalement.mockImplementation(async (_id, data) => ({
      id: 'sig-1',
      utilisateurId: 'user-2',
      typeEntite: 'ANNONCE',
      entiteId: '00000000-0000-4000-8000-000000000011',
      motif: 'SPAM',
      description: 'desc',
      statutTraitement: data.statutTraitement,
      adminId: data.adminId ?? null,
      dateTraitement: data.dateTraitement ?? null,
      dateSignalement: new Date(),
      utilisateur: { nom: 'User', prenom: 'U' },
    }) as never);

    const result = await service.traiterSignalement(
      'sig-1',
      {
        nouveauStatut: 'TRAITE',
        actionAdmin: 'Validation manuelle',
      },
      {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      },
    );

    expect(result.statutTraitement).toBe('TRAITE');
  });

  it('should use requested nouveauStatut instead of inferring from actionAdmin', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      nom: 'Admin',
      prenom: 'A',
      typeUtilisateur: { nom: 'ADMIN' },
    } as never);
    repository.findSignalementById.mockResolvedValue({
      id: 'sig-1',
      utilisateurId: 'user-2',
      typeEntite: 'ANNONCE',
      entiteId: '00000000-0000-4000-8000-000000000011',
      motif: 'SPAM',
      description: 'desc',
      statutTraitement: 'EN_ATTENTE',
      adminId: null,
      dateTraitement: null,
      dateSignalement: new Date(),
      utilisateur: { nom: 'User', prenom: 'U' },
    } as never);
    repository.updateSignalement.mockImplementation(async (_id, data) => ({
      id: 'sig-1',
      utilisateurId: 'user-2',
      typeEntite: 'ANNONCE',
      entiteId: '00000000-0000-4000-8000-000000000011',
      motif: 'SPAM',
      description: 'desc',
      statutTraitement: data.statutTraitement,
      adminId: data.adminId ?? null,
      dateTraitement: data.dateTraitement ?? null,
      dateSignalement: new Date(),
      utilisateur: { nom: 'User', prenom: 'U' },
    }) as never);

    const result = await service.traiterSignalement(
      'sig-1',
      {
        nouveauStatut: 'RESOLU',
        actionAdmin: 'REJETE MANUELLEMENT',
      },
      {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      },
    );

    expect(result.statutTraitement).toBe('RESOLU');
  });

  it('should return sanitized pagination metadata for notifications', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      typeUtilisateur: { nom: 'ACHETEUR' },
    } as never);
    repository.findNotificationsByUtilisateurPaged.mockResolvedValue({
      items: [],
      total: 0,
    } as never);

    const result = await service.getNotificationsByUtilisateur(
      'user-1',
      -5,
      500,
      {
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'ACHETEUR',
      },
    );

    expect(repository.findNotificationsByUtilisateurPaged).toHaveBeenCalledWith('user-1', 0, 100);
    expect(result.page).toBe(0);
    expect(result.size).toBe(100);
  });
});
