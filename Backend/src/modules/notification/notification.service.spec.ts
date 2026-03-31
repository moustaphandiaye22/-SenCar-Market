import type {
  NotificationRecord,
  SignalementRecord,
  UserRecord,
} from './notification.models';
import type { NotificationRepositoryPort } from './notification.repository.port';
import { NotificationService } from './notification.service';
import { NotificationAccessPolicy } from './services/notification-access.policy';
import { NotificationMapper } from './services/notification.mapper';
import { NotificationInputValidator } from './validation/notification-input.validator';

describe('NotificationService', () => {
  let repository: jest.Mocked<NotificationRepositoryPort>;
  let service: NotificationService;

  const currentUser: UserRecord = {
    id: 'user-1',
    email: 'user@test.com',
    nom: 'Ndiaye',
    prenom: 'Moustapha',
    type_utilisateur: { nom: 'UTILISATEUR' },
  };

  const adminUser: UserRecord = {
    id: 'admin-1',
    email: 'admin@test.com',
    nom: 'Admin',
    prenom: 'Root',
    type_utilisateur: { nom: 'ADMIN' },
  };

  const notification: NotificationRecord = {
    id: 'notif-1',
    utilisateur_id: 'user-1',
    titre: 'Paiement reçu',
    message: 'Votre paiement est confirmé',
    type: 'PAIEMENT',
    est_lu: false,
    reference_id: 'pay-1',
    reference_type: 'PAIEMENT',
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    date_lecture: null,
  };

  const signalement: SignalementRecord = {
    id: 'sig-1',
    utilisateur_id: 'user-1',
    type_entite: 'ANNONCE',
    entite_id: 'annonce-1',
    motif: 'ARNAQUE',
    description: 'Description détaillée',
    statut_traitement: 'EN_ATTENTE',
    traite_par: null,
    date_traitement: null,
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    utilisateur: { nom: 'Ndiaye', prenom: 'Moustapha' },
  };

  beforeEach(() => {
    repository = {
      findUserByEmail: jest.fn(),
      createNotification: jest.fn(),
      findNotificationsByUtilisateurPaged: jest.fn(),
      findUnreadNotificationsByUtilisateurPaged: jest.fn(),
      findNotificationsByTypePaged: jest.fn(),
      findNotificationById: jest.fn(),
      updateNotification: jest.fn(),
      findUnreadNotificationsByUtilisateur: jest.fn(),
      deleteNotification: jest.fn(),
      deleteAllNotifications: jest.fn(),
      countUnreadByUtilisateur: jest.fn(),
      createSignalement: jest.fn(),
      findSignalementById: jest.fn(),
      findSignalementsPaged: jest.fn(),
      findSignalementsByStatutPaged: jest.fn(),
      findSignalementsByTypePaged: jest.fn(),
      updateSignalement: jest.fn(),
      countPendingSignalements: jest.fn(),
      newId: jest.fn().mockReturnValue('generated-id'),
    } as unknown as jest.Mocked<NotificationRepositoryPort>;

    service = new NotificationService(
      repository,
      new NotificationInputValidator(),
      new NotificationAccessPolicy(),
      new NotificationMapper(),
    );
  });

  it('creates a notification with parsed type and default unread state', async () => {
    repository.createNotification.mockResolvedValue(notification);

    const result = await service.createNotification({
      utilisateurId: 'user-1',
      titre: 'Paiement reçu',
      message: 'Votre paiement est confirmé',
      type: ' paiement ',
      entiteId: 'pay-1',
      entiteType: 'PAIEMENT',
    });

    expect(repository.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        utilisateur_id: 'user-1',
        type: 'PAIEMENT',
        est_lu: false,
      }),
    );
    expect(result.type).toBe('PAIEMENT');
  });

  it('returns paginated notifications for the owner', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findNotificationsByUtilisateurPaged.mockResolvedValue({
      items: [notification],
      total: 1,
    });

    const result = await service.getNotificationsByUtilisateur(
      'user-1',
      0,
      10,
      {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      },
    );

    expect(repository.findNotificationsByUtilisateurPaged).toHaveBeenCalledWith(
      'user-1',
      0,
      10,
    );
    expect(result.content).toHaveLength(1);
    expect(result.totalElements).toBe(1);
  });

  it('marks all unread notifications as read', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.findUnreadNotificationsByUtilisateur.mockResolvedValue([
      notification,
      { ...notification, id: 'notif-2' },
    ]);
    repository.updateNotification.mockResolvedValue({
      ...notification,
      est_lu: true,
      date_lecture: new Date(),
    });

    await service.markAllAsRead('user-1', {
      userId: 'user-1',
      email: 'user@test.com',
      typeUtilisateur: 'UTILISATEUR',
    });

    expect(repository.updateNotification).toHaveBeenCalledTimes(2);
    expect(repository.updateNotification).toHaveBeenNthCalledWith(
      1,
      'notif-1',
      expect.objectContaining({ est_lu: true }),
    );
  });

  it('counts unread notifications after access control', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.countUnreadByUtilisateur.mockResolvedValue(3);

    await expect(
      service.countUnread('user-1', {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).resolves.toBe(3);
  });

  it('rejects signalement creation for another user', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);

    await expect(
      service.createSignalement(
        {
          utilisateurId: 'other-user',
          typeEntite: 'ANNONCE',
          entiteId: 'annonce-1',
          motif: 'ARNAQUE',
          description: 'Description détaillée',
        },
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Impossible de créer un signalement pour un autre utilisateur');
  });

  it('creates a signalement for the current user', async () => {
    repository.findUserByEmail.mockResolvedValue(currentUser);
    repository.createSignalement.mockResolvedValue(signalement);

    const result = await service.createSignalement(
      {
        typeEntite: 'ANNONCE',
        entiteId: 'annonce-1',
        motif: 'ARNAQUE',
        description: ' Description détaillée ',
      },
      {
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      },
    );

    expect(repository.createSignalement).toHaveBeenCalledWith(
      expect.objectContaining({
        utilisateur_id: 'user-1',
        statut_traitement: 'EN_ATTENTE',
        description: 'Description détaillée',
      }),
    );
    expect(result.utilisateurNom).toBe('Moustapha Ndiaye');
  });

  it('rejects already processed signalements', async () => {
    repository.findUserByEmail.mockResolvedValue(adminUser);
    repository.findSignalementById.mockResolvedValue({
      ...signalement,
      statut_traitement: 'TRAITE',
    });

    await expect(
      service.traiterSignalement(
        'sig-1',
        {
          actionAdmin: 'Action prise',
          nouveauStatut: 'RESOLU',
        },
        {
          userId: 'admin-1',
          email: 'admin@test.com',
          typeUtilisateur: 'ADMIN',
        },
      ),
    ).rejects.toThrow('Ce signalement a déjà été traité');
  });

  it('processes a pending signalement for a moderator or admin', async () => {
    repository.findUserByEmail.mockResolvedValue(adminUser);
    repository.findSignalementById.mockResolvedValue(signalement);
    repository.updateSignalement.mockResolvedValue({
      ...signalement,
      statut_traitement: 'RESOLU',
      traite_par: 'admin-1',
      date_traitement: new Date('2026-03-02T00:00:00.000Z'),
    });

    const result = await service.traiterSignalement(
      'sig-1',
      {
        actionAdmin: 'Annonce supprimée',
        nouveauStatut: 'RESOLU',
      },
      {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      },
    );

    expect(repository.updateSignalement).toHaveBeenCalledWith(
      'sig-1',
      expect.objectContaining({
        statut_traitement: 'RESOLU',
        traite_par: 'admin-1',
      }),
    );
    expect(result.adminId).toBe('admin-1');
  });

  it('returns pending signalements for admins with safe pagination', async () => {
    repository.findUserByEmail.mockResolvedValue(adminUser);
    repository.findSignalementsByStatutPaged.mockResolvedValue({
      items: [signalement],
      total: 1,
    });

    const result = await service.getPendingSignalements(
      -5,
      0,
      {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      },
    );

    expect(repository.findSignalementsByStatutPaged).toHaveBeenCalledWith(
      'EN_ATTENTE',
      0,
      1,
    );
    expect(result.content).toHaveLength(1);
  });
});
