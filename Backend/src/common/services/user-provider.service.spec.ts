import { UserProviderService } from './user-provider.service';

describe('UserProviderService', () => {
  let service: UserProviderService;
  let repository: {
    findUserByEmail: jest.Mock;
    findUserById: jest.Mock;
    newId: jest.Mock;
  };

  beforeEach(() => {
    service = new UserProviderService();
    repository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      newId: jest.fn(),
    };
  });

  it('gets the current user and caches it by user id', async () => {
    repository.findUserById.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.getCurrentUser(
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
        repository,
      ),
    ).resolves.toEqual({ id: 'user-1' });

    await expect(
      service.getCurrentUser(
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
        repository,
      ),
    ).resolves.toEqual({ id: 'user-1' });

    expect(repository.findUserById).toHaveBeenCalledTimes(1);
  });

  it('throws when getCurrentUser cannot find the user', async () => {
    repository.findUserById.mockResolvedValue(null);

    await expect(
      service.getCurrentUser(
        {
          userId: 'missing',
          email: 'missing@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
        repository,
      ),
    ).rejects.toThrow('Utilisateur non trouvé');
  });

  it('finds users by email and caches null markers too', async () => {
    repository.findUserByEmail
      .mockResolvedValueOnce({ id: 'user-1', email: 'user@test.com' })
      .mockResolvedValueOnce(null);

    await expect(
      service.findByEmail('user@test.com', repository),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'user@test.com',
    });

    await expect(
      service.findByEmail('user@test.com', repository),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'user@test.com',
    });

    await expect(service.findByEmail('missing@test.com', repository)).resolves.toBeNull();
    await expect(service.findByEmail('missing@test.com', repository)).resolves.toBe('NULL_MARKER');
  });

  it('requires a user by email and clears cache on demand', async () => {
    repository.findUserByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'user-2',
      email: 'user2@test.com',
    });

    await expect(
      service.mustFindByEmail('user@test.com', repository),
    ).rejects.toThrow('Utilisateur non trouvé');

    service.clearCache();

    await expect(
      service.mustFindByEmail('user2@test.com', repository),
    ).resolves.toEqual({
      id: 'user-2',
      email: 'user2@test.com',
    });
  });
});
