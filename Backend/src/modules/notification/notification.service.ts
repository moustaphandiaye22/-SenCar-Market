import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { buildPaged, parsePaginationParams } from '../../common/utils/pagination-helper.util';
import { requireNonBlank } from '../../common/utils/text.util';

import { ActionAdminRequestDto } from './dto/action-admin-request.dto';
import { CreateSignalementRequestDto } from './dto/create-signalement-request.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { SignalementResponseDto } from './dto/signalement-response.dto';
import { NotificationRecord, SignalementRecord, UserRecord } from './notification.models';
import { NOTIFICATION_REPOSITORY_PORT, NotificationRepositoryPort } from './notification.repository.port';
import { NotificationAccessPolicy } from './services/notification-access.policy';
import { NotificationMapper } from './services/notification.mapper';
import { NotificationInputValidator } from './validation/notification-input.validator';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PORT) private readonly repository: NotificationRepositoryPort,
    private readonly inputValidator: NotificationInputValidator,
    private readonly accessPolicy: NotificationAccessPolicy,
    private readonly mapper: NotificationMapper,
  ) {}

  async createNotification(data: {
    utilisateurId: string;
    titre: string;
    message: string;
    type: string;
    entiteId?: string;
    entiteType?: string;
  }): Promise<NotificationResponseDto> {
    const created = await this.repository.createNotification({
      id: this.repository.newId(),
      utilisateur_id: data.utilisateurId,
      titre: data.titre,
      message: data.message,
      type: this.inputValidator.parseNotificationType(data.type),
      reference_id: data.entiteId,
      reference_type: data.entiteType,
      est_lu: false,
      created_at: new Date(),
    });

    return this.mapper.toNotificationResponse(created);
  }

  async getNotificationsByUtilisateur(
    utilisateurId: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findNotificationsByUtilisateurPaged(utilisateurId, safePage, safeSize);
    return this.toPagedNotifications(data.items, data.total, safePage, safeSize);
  }

  async getUnreadNotifications(
    utilisateurId: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findUnreadNotificationsByUtilisateurPaged(utilisateurId, safePage, safeSize);
    return this.toPagedNotifications(data.items, data.total, safePage, safeSize);
  }

  async getNotificationsByType(
    utilisateurId: string,
    type: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const parsedType = this.inputValidator.parseNotificationType(type);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findNotificationsByTypePaged(utilisateurId, parsedType, safePage, safeSize);
    return this.toPagedNotifications(data.items, data.total, safePage, safeSize);
  }

  async markAsRead(id: string, user: AuthenticatedUser): Promise<NotificationResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const notification = await this.mustFindNotification(id);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, notification.utilisateur_id);

    const updated = await this.repository.updateNotification(id, {
      est_lu: true,
      date_lecture: new Date(),
    });

    return this.mapper.toNotificationResponse(updated);
  }

  async markAllAsRead(utilisateurId: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const notifications = await this.repository.findUnreadNotificationsByUtilisateur(utilisateurId);
    await Promise.all(
      notifications.map((item) =>
        this.repository.updateNotification(item.id, {
          est_lu: true,
          date_lecture: new Date(),
        }),
      ),
    );
  }

  async deleteNotification(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const notification = await this.mustFindNotification(id);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, notification.utilisateur_id);
    await this.repository.deleteNotification(id);
  }

  async deleteAllNotifications(utilisateurId: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);
    await this.repository.deleteAllNotifications(utilisateurId);
  }

  async countUnread(utilisateurId: string, user: AuthenticatedUser): Promise<number> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);
    return this.repository.countUnreadByUtilisateur(utilisateurId);
  }

  async getNotificationById(id: string, user: AuthenticatedUser): Promise<NotificationResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const notification = await this.mustFindNotification(id);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, notification.utilisateur_id);
    return this.mapper.toNotificationResponse(notification);
  }

  async createSignalement(
    request: CreateSignalementRequestDto,
    user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const description = requireNonBlank(request.description, 'Description requise', 'SIGNALEMENT_DESCRIPTION_REQUIRED');
    if (request.utilisateurId && request.utilisateurId !== currentUser.id) {
      throw new DomainException('Impossible de créer un signalement pour un autre utilisateur', 403, 'SIGNALEMENT_CANNOT_CREATE_FOR_OTHER');
    }

    const created = await this.repository.createSignalement({
      id: this.repository.newId(),
      utilisateur_id: currentUser.id,
      type_entite: request.typeEntite,
      entite_id: request.entiteId,
      motif: request.motif,
      description,
      statut_traitement: 'EN_ATTENTE',
      created_at: new Date(),
    });

    return this.mapper.toSignalementResponse(created);
  }

  async getSignalementById(id: string, user: AuthenticatedUser): Promise<SignalementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);

    const signalement = await this.mustFindSignalement(id);
    return this.mapper.toSignalementResponse(signalement);
  }

  async getAllSignalements(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);

    const parsedSortDir = this.inputValidator.parseSortDir(sortDir);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findSignalementsPaged(safePage, safeSize, sortBy, parsedSortDir);

    return this.toPagedSignalements(data.items, data.total, safePage, safeSize);
  }

  async getPendingSignalements(
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findSignalementsByStatutPaged('EN_ATTENTE', safePage, safeSize);
    return this.toPagedSignalements(data.items, data.total, safePage, safeSize);
  }

  async getSignalementsByStatut(
    statut: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);

    const parsed = this.inputValidator.parseSignalementStatut(statut);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findSignalementsByStatutPaged(parsed, safePage, safeSize);
    return this.toPagedSignalements(data.items, data.total, safePage, safeSize);
  }

  async getSignalementsByType(
    typeEntite: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);

    const parsed = this.inputValidator.parseSignalementType(typeEntite);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });
    const data = await this.repository.findSignalementsByTypePaged(parsed, safePage, safeSize);
    return this.toPagedSignalements(data.items, data.total, safePage, safeSize);
  }

  async traiterSignalement(
    id: string,
    request: ActionAdminRequestDto,
    user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);
    requireNonBlank(request.actionAdmin, 'Action admin requise', 'SIGNALEMENT_ACTION_REQUIRED');

    const signalement = await this.mustFindSignalement(id);
    if (signalement.statut_traitement === 'TRAITE' || signalement.statut_traitement === 'RESOLU') {
      throw new DomainException('Ce signalement a déjà été traité', 400, 'SIGNALEMENT_ALREADY_PROCESSED');
    }

    const updated = await this.repository.updateSignalement(id, {
      statut_traitement: request.nouveauStatut,
      traite_par: currentUser.id,
      date_traitement: new Date(),
    });

    return this.mapper.toSignalementResponse(updated);
  }

  async countPending(user: AuthenticatedUser): Promise<number> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertModeratorOrAdmin(currentUser.type_utilisateur?.nom);
    return this.repository.countPendingSignalements();
  }

  private async mustFindCurrentUser(email: string): Promise<UserRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindNotification(id: string): Promise<NotificationRecord> {
    const notification = await this.repository.findNotificationById(id);
    if (!notification) {
      throw new DomainException('Notification non trouvée', 404, 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  }

  private async mustFindSignalement(id: string): Promise<SignalementRecord> {
    const signalement = await this.repository.findSignalementById(id);
    if (!signalement) {
      throw new DomainException('Signalement non trouvé', 404, 'SIGNALEMENT_NOT_FOUND');
    }
    return signalement;
  }

  private toPagedNotifications(
    items: NotificationRecord[],
    total: number,
    page: number,
    size: number,
  ): PaginatedResponseDto<NotificationResponseDto> {
    return buildPaged(
      items.map((item) => this.mapper.toNotificationResponse(item)),
      page,
      size,
      total,
    );
  }

  private toPagedSignalements(
    items: SignalementRecord[],
    total: number,
    page: number,
    size: number,
  ): PaginatedResponseDto<SignalementResponseDto> {
    return buildPaged(
      items.map((item) => this.mapper.toSignalementResponse(item)),
      page,
      size,
      total,
    );
  }
}
