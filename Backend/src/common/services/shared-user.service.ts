import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import {
  ROLES_ADMIN_MODERATION,
  ROLES_ADMIN_SUPER_ADMIN,
} from "../constants/role-groups";
import { DomainException } from "../exceptions/domain.exception";
import type { AuthenticatedUser } from "../types/authenticated-user.type";
import { hasAnyRole } from "../utils/role.util";

/**
 * Shared User type with basic information common across all modules
 */
export interface SharedUserRecord {
  id: string;
  email: string;
  telephone: string | null;
  nom: string | null;
  prenom: string | null;
  type_utilisateur: {
    nom: string;
  } | null;
}

/**
 * Injection token for SharedUserService
 */
export const SHARED_USER_SERVICE = "SHARED_USER_SERVICE";

/**
 * Shared User Service - eliminates DRY violations for user lookup across all modules
 *
 * This service provides centralized user lookup functionality that was previously
 * duplicated in every repository and service throughout the application.
 *
 * @example
 * // Instead of each service having:
 * private async mustFindCurrentUser(email: string) {
 *   const user = await this.repository.findUserByEmail(email);
 *   if (!user) throw new DomainException('User not found', 404);
 *   return user;
 * }
 *
 * // Now simply inject and use:
 * constructor(private readonly userService: SharedUserService) {}
 *
 * async myMethod(user: AuthenticatedUser) {
 *   const currentUser = await this.userService.getCurrentUser(user);
 * }
 */
@Injectable()
export class SharedUserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current user from authenticated user (JWT payload)
   * Uses userId from JWT to fetch full user record
   */
  async getCurrentUser(
    authenticatedUser: AuthenticatedUser,
  ): Promise<SharedUserRecord> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: authenticatedUser.userId },
      include: { type_utilisateur: true },
    });

    if (!user) {
      throw new DomainException(
        "Utilisateur non trouvé",
        404,
        "USER_NOT_FOUND",
      );
    }

    return this.toSharedUserRecord(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SharedUserRecord | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email },
      include: { type_utilisateur: true },
    });

    return user ? this.toSharedUserRecord(user) : null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<SharedUserRecord | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
      include: { type_utilisateur: true },
    });

    return user ? this.toSharedUserRecord(user) : null;
  }

  /**
   * Find user by telephone
   */
  async findByTelephone(telephone: string): Promise<SharedUserRecord | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { telephone },
      include: { type_utilisateur: true },
    });

    return user ? this.toSharedUserRecord(user) : null;
  }

  /**
   * Find user by email or telephone
   */
  async findByEmailOrTelephone(
    identifiant: string,
  ): Promise<SharedUserRecord | null> {
    const user = await this.prisma.utilisateur.findFirst({
      where: {
        OR: [{ email: identifiant }, { telephone: identifiant }],
      },
      include: { type_utilisateur: true },
    });

    return user ? this.toSharedUserRecord(user) : null;
  }

  /**
   * Require current user - throws if not found
   */
  async mustGetCurrentUser(
    authenticatedUser: AuthenticatedUser,
  ): Promise<SharedUserRecord> {
    const user = await this.getCurrentUser(authenticatedUser);
    if (!user) {
      throw new DomainException(
        "Utilisateur non trouvé",
        404,
        "USER_NOT_FOUND",
      );
    }
    return user;
  }

  /**
   * Require user by email - throws if not found
   */
  async mustFindByEmail(email: string): Promise<SharedUserRecord> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new DomainException(
        "Utilisateur non trouvé",
        404,
        "USER_NOT_FOUND",
      );
    }
    return user;
  }

  /**
   * Require user by ID - throws if not found
   */
  async mustFindById(id: string): Promise<SharedUserRecord> {
    const user = await this.findById(id);
    if (!user) {
      throw new DomainException(
        "Utilisateur non trouvé",
        404,
        "USER_NOT_FOUND",
      );
    }
    return user;
  }

  /**
   * Check if current user is admin
   */
  async isAdmin(authenticatedUser: AuthenticatedUser): Promise<boolean> {
    const user = await this.getCurrentUser(authenticatedUser);
    return hasAnyRole(user.type_utilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN);
  }

  /**
   * Check if current user is admin or moderator
   */
  async isAdminOrModerator(
    authenticatedUser: AuthenticatedUser,
  ): Promise<boolean> {
    const user = await this.getCurrentUser(authenticatedUser);
    return hasAnyRole(user.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);
  }

  /**
   * Ensure current user is admin - throws if not
   */
  async ensureAdmin(
    authenticatedUser: AuthenticatedUser,
  ): Promise<SharedUserRecord> {
    const user = await this.getCurrentUser(authenticatedUser);
    if (!hasAnyRole(user.type_utilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN)) {
      throw new DomainException(
        "Accès refusé. Droits administrateur requis.",
        403,
        "ADMIN_REQUIRED",
      );
    }
    return user;
  }

  /**
   * Ensure current user is admin or moderator - throws if not
   */
  async ensureAdminOrModerator(
    authenticatedUser: AuthenticatedUser,
  ): Promise<SharedUserRecord> {
    const user = await this.getCurrentUser(authenticatedUser);
    if (!hasAnyRole(user.type_utilisateur?.nom, ROLES_ADMIN_MODERATION)) {
      throw new DomainException(
        "Accès refusé. Droits administrateur ou modérateur requis.",
        403,
        "ADMIN_OR_MODERATOR_REQUIRED",
      );
    }
    return user;
  }

  /**
   * Check if user owns the resource or is admin
   */
  async isOwnerOrAdmin(
    authenticatedUser: AuthenticatedUser,
    ownerId: string,
  ): Promise<boolean> {
    const user = await this.getCurrentUser(authenticatedUser);

    // User is owner
    if (user.id === ownerId) {
      return true;
    }

    // User is admin
    return hasAnyRole(user.type_utilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN);
  }

  /**
   * Check if user can access another user's data (owner or admin)
   */
  async canAccessUserData(
    authenticatedUser: AuthenticatedUser,
    targetUserId: string,
  ): Promise<{ allowed: boolean; user: SharedUserRecord }> {
    const user = await this.getCurrentUser(authenticatedUser);

    // User is the target
    if (user.id === targetUserId) {
      return { allowed: true, user };
    }

    // User is admin
    if (hasAnyRole(user.type_utilisateur?.nom, ROLES_ADMIN_SUPER_ADMIN)) {
      return { allowed: true, user };
    }

    return { allowed: false, user };
  }

  /**
   * Convert Prisma user to shared user record
   */
  private toSharedUserRecord(user: {
    id: string;
    email: string;
    telephone: string | null;
    nom: string | null;
    prenom: string | null;
    type_utilisateur: { nom: string } | null;
  }): SharedUserRecord {
    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      nom: user.nom,
      prenom: user.prenom,
      type_utilisateur: user.type_utilisateur,
    };
  }
}
