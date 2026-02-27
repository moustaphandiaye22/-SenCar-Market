import { Injectable } from '@nestjs/common';

import { DomainException } from '../exceptions/domain.exception';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

/**
 * Base interface for user repositories
 * Each module implements this for its own user type
 */
export interface UserRepositoryPort {
  findUserByEmail(email: string): Promise<unknown>;
  findUserById(id: string): Promise<unknown>;
  newId(): string;
}

/**
 * User context that caches the current user for a request
 * This avoids repeated database lookups for the same user
 */
export interface UserContext {
  userId: string;
  email: string;
  userRecord?: unknown;
}

/**
 * Shared UserProvider service to eliminate repeated user fetching patterns
 * Uses request scoping to maintain user context per request
 *
 * This service fixes the DRY violation where every service has:
 * private async mustFindCurrentUser(email: string) { ... }
 *
 * @example
 * // Instead of:
 * private async mustFindCurrentUser(email: string): Promise<UserRecord> {
 *   const user = await this.repository.findUserByEmail(email);
 *   if (!user) throw new DomainException('User not found', 404, 'USER_NOT_FOUND');
 *   return user as UserRecord;
 * }
 *
 * // Now simply inject and use:
 * constructor(private readonly userProvider: UserProvider) {}
 *
 * async myMethod(user: AuthenticatedUser) {
 *   const currentUser = await this.userProvider.getCurrentUser(user, this.userRepository);
 * }
 */
@Injectable()
export class UserProviderService {
  private userCache = new Map<string, unknown>();

  /**
   * Get the current user from cache or fetch from repository
   * Caches the result for the duration of the request
   *
   * @param authenticatedUser - The authenticated user from JWT
   * @param repository - The user repository port to fetch from
   * @throws DomainException if user not found
   */
  async getCurrentUser<TUser>(
    authenticatedUser: AuthenticatedUser,
    repository: UserRepositoryPort,
  ): Promise<TUser> {
    const cacheKey = `user:${authenticatedUser.userId}`;

    const cached = this.userCache.get(cacheKey);
    if (cached) {
      return cached as TUser;
    }

    const user = await repository.findUserById(authenticatedUser.userId);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    this.userCache.set(cacheKey, user);
    return user as TUser;
  }

  /**
   * Find a user by email (with caching)
   */
  async findByEmail<TUser>(email: string, repository: UserRepositoryPort): Promise<TUser | null> {
    const cacheKey = `email:${email}`;

    const cached = this.userCache.get(cacheKey);
    if (cached !== undefined) {
      return cached as TUser | null;
    }

    const user = await repository.findUserByEmail(email);
    this.userCache.set(cacheKey, user ?? 'NULL_MARKER');
    return user as TUser | null;
  }

  /**
   * Require a user by email, throw if not found
   */
  async mustFindByEmail<TUser>(email: string, repository: UserRepositoryPort): Promise<TUser> {
    const user = await this.findByEmail<TUser>(email, repository);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  /**
   * Clear the user cache (call at end of request if needed)
   */
  clearCache(): void {
    this.userCache.clear();
  }
}

/**
 * Injection token for UserProviderService
 */
export const USER_PROVIDER_SERVICE = 'USER_PROVIDER_SERVICE';
