import { NotificationRepository } from './notification.repository';

describe('NotificationRepository', () => {
  const prisma = {
    utilisateur: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    signalement: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const repository = new NotificationRepository(prisma as never);

  const notification = {
    id: 'notif-1',
    utilisateur_id: 'user-1',
    titre: 'Titre',
    message: 'Message',
    type: 'PAIEMENT',
    est_lu: false,
    reference_id: 'ref-1',
    reference_type: 'PAIEMENT',
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    date_lecture: null,
  };

  const signalementRecord = {
    id: 'sig-1',
    utilisateur_id: 'user-1',
    type_entite: 'ANNONCE',
    entite_id: 'annonce-1',
    motif: 'ARNAQUE',
    description: 'Signalement',
    statut_traitement: 'EN_ATTENTE',
    traite_par: null,
    date_traitement: null,
    created_at: new Date('2026-03-01T00:00:00.000Z'),
    utilisateur_signalement_utilisateur_idToutilisateur: {
      nom: 'Ndiaye',
      prenom: 'Moustapha',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finds a user by email', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      nom: 'Ndiaye',
      prenom: 'Moustapha',
      type_utilisateur: { nom: 'UTILISATEUR' },
    });

    await expect(repository.findUserByEmail('user@test.com')).resolves.toEqual({
      id: 'user-1',
      email: 'user@test.com',
      nom: 'Ndiaye',
      prenom: 'Moustapha',
      type_utilisateur: { nom: 'UTILISATEUR' },
    });
  });

  it('creates, updates, finds and deletes notifications', async () => {
    prisma.notification.create.mockResolvedValue(notification);
    prisma.notification.update.mockResolvedValue({
      ...notification,
      est_lu: true,
    });
    prisma.notification.findUnique.mockResolvedValue(notification);
    prisma.notification.delete.mockResolvedValue(notification);
    prisma.notification.deleteMany.mockResolvedValue({ count: 3 });

    await expect(
      repository.createNotification({
        id: 'notif-1',
        utilisateur_id: 'user-1',
        titre: 'Titre',
        message: 'Message',
        type: 'PAIEMENT',
        est_lu: false,
        created_at: new Date('2026-03-01T00:00:00.000Z'),
      }),
    ).resolves.toEqual(notification);

    await expect(
      repository.updateNotification('notif-1', { est_lu: true }),
    ).resolves.toEqual({
      ...notification,
      est_lu: true,
    });

    await expect(repository.findNotificationById('notif-1')).resolves.toEqual(
      notification,
    );
    await expect(repository.deleteNotification('notif-1')).resolves.toEqual(
      notification,
    );
    await expect(repository.deleteAllNotifications('user-1')).resolves.toEqual({
      count: 3,
    });
  });

  it('returns paginated notifications and unread counters', async () => {
    prisma.notification.findMany
      .mockResolvedValueOnce([notification])
      .mockResolvedValueOnce([{ ...notification, est_lu: false }])
      .mockResolvedValueOnce([notification])
      .mockResolvedValueOnce([{ ...notification, est_lu: false }]);
    prisma.notification.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    await expect(
      repository.findNotificationsByUtilisateurPaged('user-1', 0, 10),
    ).resolves.toEqual({
      items: [notification],
      total: 1,
    });

    await expect(
      repository.findUnreadNotificationsByUtilisateurPaged('user-1', 0, 10),
    ).resolves.toEqual({
      items: [{ ...notification, est_lu: false }],
      total: 1,
    });

    await expect(
      repository.findNotificationsByTypePaged('user-1', 'PAIEMENT', 0, 10),
    ).resolves.toEqual({
      items: [notification],
      total: 1,
    });

    await expect(
      repository.findUnreadNotificationsByUtilisateur('user-1'),
    ).resolves.toEqual([{ ...notification, est_lu: false }]);

    await expect(repository.countUnreadByUtilisateur('user-1')).resolves.toBe(
      2,
    );
  });

  it('creates, updates and finds signalements with mapped user info', async () => {
    prisma.signalement.create.mockResolvedValue(signalementRecord);
    prisma.signalement.update.mockResolvedValue({
      ...signalementRecord,
      statut_traitement: 'RESOLU',
    });
    prisma.signalement.findUnique.mockResolvedValue(signalementRecord);

    await expect(
      repository.createSignalement({
        id: 'sig-1',
        utilisateur_id: 'user-1',
        type_entite: 'ANNONCE',
        entite_id: 'annonce-1',
        motif: 'ARNAQUE',
        description: 'Signalement',
        statut_traitement: 'EN_ATTENTE',
        created_at: new Date('2026-03-01T00:00:00.000Z'),
      }),
    ).resolves.toEqual({
      ...signalementRecord,
      utilisateur: {
        nom: 'Ndiaye',
        prenom: 'Moustapha',
      },
    });

    await expect(
      repository.updateSignalement('sig-1', { statut_traitement: 'RESOLU' }),
    ).resolves.toEqual({
      ...signalementRecord,
      statut_traitement: 'RESOLU',
      utilisateur: {
        nom: 'Ndiaye',
        prenom: 'Moustapha',
      },
    });

    await expect(repository.findSignalementById('sig-1')).resolves.toEqual({
      ...signalementRecord,
      utilisateur: {
        nom: 'Ndiaye',
        prenom: 'Moustapha',
      },
    });
  });

  it('returns null when a signalement is not found', async () => {
    prisma.signalement.findUnique.mockResolvedValue(null);

    await expect(repository.findSignalementById('missing')).resolves.toBeNull();
  });

  it('returns paginated signalements by all filters and counts pending ones', async () => {
    prisma.signalement.findMany
      .mockResolvedValueOnce([signalementRecord])
      .mockResolvedValueOnce([signalementRecord])
      .mockResolvedValueOnce([signalementRecord]);
    prisma.signalement.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(4);

    const mapped = {
      ...signalementRecord,
      utilisateur: {
        nom: 'Ndiaye',
        prenom: 'Moustapha',
      },
    };

    await expect(
      repository.findSignalementsPaged(0, 10, 'dateSignalement', 'desc'),
    ).resolves.toEqual({
      items: [mapped],
      total: 1,
    });

    await expect(
      repository.findSignalementsByStatutPaged('EN_ATTENTE', 0, 10),
    ).resolves.toEqual({
      items: [mapped],
      total: 1,
    });

    await expect(
      repository.findSignalementsByTypePaged('ANNONCE', 0, 10),
    ).resolves.toEqual({
      items: [mapped],
      total: 1,
    });

    await expect(repository.countPendingSignalements()).resolves.toBe(4);
  });

  it('generates ids', () => {
    expect(typeof repository.newId()).toBe('string');
    expect(repository.newId()).toHaveLength(36);
  });
});
