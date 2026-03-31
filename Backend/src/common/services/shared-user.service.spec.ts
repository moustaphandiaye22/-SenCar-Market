import { SharedUserService } from './shared-user.service';

describe('SharedUserService', () => {
  const prisma = {
    utilisateur: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const service = new SharedUserService(prisma as never);

  const regularUser = {
    id: 'user-1',
    email: 'user@test.com',
    telephone: '770000000',
    nom: 'Ndiaye',
    prenom: 'Moustapha',
    type_utilisateur: { nom: 'UTILISATEUR' },
  };

  const adminUser = {
    ...regularUser,
    id: 'admin-1',
    email: 'admin@test.com',
    type_utilisateur: { nom: 'ADMIN' },
  };

  const moderatorUser = {
    ...regularUser,
    id: 'expert-1',
    email: 'expert@test.com',
    type_utilisateur: { nom: 'EXPERT' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets the current user from the authenticated payload', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue(regularUser);

    await expect(
      service.getCurrentUser({
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).resolves.toEqual(regularUser);
  });

  it('throws when the current user cannot be found', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue(null);

    await expect(
      service.getCurrentUser({
        userId: 'missing',
        email: 'missing@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Utilisateur non trouvé');
  });

  it('finds users by email, id, telephone and email-or-telephone', async () => {
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(regularUser);
    prisma.utilisateur.findFirst.mockResolvedValueOnce(regularUser);

    await expect(service.findByEmail('user@test.com')).resolves.toEqual(
      regularUser,
    );
    await expect(service.findById('user-1')).resolves.toEqual(regularUser);
    await expect(service.findByTelephone('770000000')).resolves.toEqual(
      regularUser,
    );
    await expect(
      service.findByEmailOrTelephone('user@test.com'),
    ).resolves.toEqual(regularUser);
  });

  it('returns null for missing optional lookups', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue(null);
    prisma.utilisateur.findFirst.mockResolvedValue(null);

    await expect(service.findByEmail('missing@test.com')).resolves.toBeNull();
    await expect(service.findById('missing')).resolves.toBeNull();
    await expect(service.findByTelephone('000')).resolves.toBeNull();
    await expect(service.findByEmailOrTelephone('missing')).resolves.toBeNull();
  });

  it('requires existing users for mustFind helpers', async () => {
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(regularUser);

    await expect(service.mustFindByEmail('user@test.com')).resolves.toEqual(
      regularUser,
    );
    await expect(service.mustFindById('user-1')).resolves.toEqual(regularUser);
    await expect(
      service.mustGetCurrentUser({
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).resolves.toEqual(regularUser);
  });

  it('detects admin and moderator capabilities', async () => {
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce(adminUser);

    await expect(
      service.isAdmin({
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).resolves.toBe(true);

    await expect(
      service.isAdminOrModerator({
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).resolves.toBe(true);

    await expect(
      service.ensureAdmin({
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).resolves.toEqual(adminUser);

    await expect(
      service.ensureAdminOrModerator({
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).resolves.toEqual(adminUser);
  });

  it('rejects users without sufficient privileges', async () => {
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(moderatorUser);

    await expect(
      service.ensureAdmin({
        userId: 'user-1',
        email: 'user@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Droits administrateur requis');

    await expect(
      service.ensureAdminOrModerator({
        userId: 'expert-1',
        email: 'expert@test.com',
        typeUtilisateur: 'EXPERT',
      }),
    ).rejects.toThrow('Droits administrateur ou modérateur requis');
  });

  it('evaluates owner or admin access correctly', async () => {
    prisma.utilisateur.findUnique
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce(regularUser);

    await expect(
      service.isOwnerOrAdmin(
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
        'user-1',
      ),
    ).resolves.toBe(true);

    await expect(
      service.isOwnerOrAdmin(
        {
          userId: 'admin-1',
          email: 'admin@test.com',
          typeUtilisateur: 'ADMIN',
        },
        'other-user',
      ),
    ).resolves.toBe(true);

    await expect(
      service.canAccessUserData(
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
        'other-user',
      ),
    ).resolves.toEqual({
      allowed: false,
      user: regularUser,
    });

    await expect(
      service.canAccessUserData(
        {
          userId: 'admin-1',
          email: 'admin@test.com',
          typeUtilisateur: 'ADMIN',
        },
        'other-user',
      ),
    ).resolves.toEqual({
      allowed: true,
      user: adminUser,
    });

    await expect(
      service.canAccessUserData(
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
        'user-1',
      ),
    ).resolves.toEqual({
      allowed: true,
      user: regularUser,
    });
  });
});
