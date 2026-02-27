import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { buildPaged, parsePaginationParams } from '../../../common/utils/pagination-helper.util';
import { UtilisateurResponseDto } from '../../auth/dto/utilisateur-response.dto';
import { AdminUserRecord } from '../admin.models';
import { ADMIN_REPOSITORY_PORT, AdminRepositoryPort } from '../admin.repository.port';
import { AdminInputValidator } from '../validation/admin-input.validator';

import { AdminAccessPolicy } from './admin-access.policy';
import { AdminMapper } from './admin.mapper';

/**
 * Admin User Management Service - Single Responsibility for user management
 * Handles user CRUD operations, suspension, reactivation, banning, and role modification
 */
@Injectable()
export class AdminUserManagementService {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT) private readonly repository: AdminRepositoryPort,
    private readonly inputValidator: AdminInputValidator,
    private readonly accessPolicy: AdminAccessPolicy,
    private readonly mapper: AdminMapper,
  ) {}

  /**
   * Get all users with pagination
   */
  async getAllUtilisateurs(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<UtilisateurResponseDto>> {
    await this.ensureAdmin(user);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size);
    const parsedSortDir = this.inputValidator.parseSortDir(sortDir);

    const { items, total } = await this.repository.findUsersPaged(safePage, safeSize, sortBy, parsedSortDir);
    return buildPaged(
      items.map((u: AdminUserRecord) => this.mapper.toUtilisateurResponse(u)),
      safePage,
      safeSize,
      total,
    );
  }

  /**
   * Get user by ID
   */
  async getUtilisateurById(utilisateurId: string, user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    return this.mapper.toUtilisateurResponse(found);
  }

  /**
   * Suspend a user
   */
  async suspendreUtilisateur(
    utilisateurId: string,
    raison: string,
    user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);
    const raisonNettoyee = this.inputValidator.requireReason(raison);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const saved = await this.repository.updateUser(utilisateurId, { deletedAt: new Date() });
    await this.notifyUtilisateur(utilisateurId, 'SUSPENSION', `Votre compte a été suspendu. Raison: ${raisonNettoyee}`);
    return this.mapper.toUtilisateurResponse(saved);
  }

  /**
   * Reactivate a user
   */
  async reactiverUtilisateur(utilisateurId: string, user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const saved = await this.repository.updateUser(utilisateurId, { deletedAt: null });
    await this.notifyUtilisateur(utilisateurId, 'REACTIVATION', 'Votre compte a été réactivé.');
    return this.mapper.toUtilisateurResponse(saved);
  }

  /**
   * Ban a user permanently
   */
  async bannirUtilisateur(utilisateurId: string, raison: string, user: AuthenticatedUser): Promise<void> {
    await this.ensureAdmin(user);
    const raisonNettoyee = this.inputValidator.requireReason(raison);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const bannedUntil = new Date();
    bannedUntil.setFullYear(bannedUntil.getFullYear() + 100);
    await this.repository.updateUser(utilisateurId, { deletedAt: bannedUntil });
    await this.notifyUtilisateur(utilisateurId, 'BAN', `Votre compte a été banni. Raison: ${raisonNettoyee}`);
  }

  /**
   * Modify user role
   */
  async modifierRole(
    utilisateurId: string,
    nouveauRole: string,
    user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);

    const [target, role] = await Promise.all([
      this.repository.findUserById(utilisateurId),
      this.repository.findTypeUtilisateurByNom(nouveauRole),
    ]);

    if (!target) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    if (!role) throw new DomainException('Rôle invalide', 400, 'ROLE_INVALID');

    const saved = await this.repository.updateUser(utilisateurId, { typeUtilisateurId: role.id });
    await this.notifyUtilisateur(utilisateurId, 'MODIFICATION_ROLE', `Votre rôle a été modifié vers ${nouveauRole}`);
    return this.mapper.toUtilisateurResponse(saved);
  }

  // Private helpers

  private async ensureAdmin(user: AuthenticatedUser): Promise<void> {
    const current = await this.repository.findUserByEmail(user.email);
    this.accessPolicy.assertAdmin(current);
  }

  private async notifyUtilisateur(utilisateurId: string, type: string, message: string): Promise<void> {
    await this.repository.createNotification({
      id: this.repository.newId(),
      utilisateur: { connect: { id: utilisateurId } },
      titre: type,
      message,
      type: 'ABONNEMENT',
      estLu: false,
      dateCreation: new Date(),
      referenceType: type,
    });
  }
}
