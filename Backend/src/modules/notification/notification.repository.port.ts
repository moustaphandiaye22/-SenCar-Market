import type {
  CreateNotificationInput,
  CreateSignalementInput,
  NotificationRecord,
  SignalementRecord,
  UpdateNotificationInput,
  UpdateSignalementInput,
  UserRecord,
} from './notification.models';
import type { StatutTraitementSignalement, TypeEntiteSignalable, TypeNotification } from './types/notification.types';

export const NOTIFICATION_REPOSITORY_PORT = Symbol('NOTIFICATION_REPOSITORY_PORT');

export interface NotificationRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;

  createNotification(data: CreateNotificationInput): Promise<NotificationRecord>;
  updateNotification(id: string, data: UpdateNotificationInput): Promise<NotificationRecord>;
  findNotificationById(id: string): Promise<NotificationRecord | null>;

  findNotificationsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }>;
  findUnreadNotificationsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }>;
  findNotificationsByTypePaged(
    utilisateurId: string,
    type: TypeNotification,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }>;
  findUnreadNotificationsByUtilisateur(utilisateurId: string): Promise<NotificationRecord[]>;
  countUnreadByUtilisateur(utilisateurId: string): Promise<number>;
  deleteNotification(id: string): Promise<NotificationRecord>;
  deleteAllNotifications(utilisateurId: string): Promise<{ count: number }>;

  createSignalement(data: CreateSignalementInput): Promise<SignalementRecord>;
  updateSignalement(id: string, data: UpdateSignalementInput): Promise<SignalementRecord>;
  findSignalementById(id: string): Promise<SignalementRecord | null>;
  findSignalementsPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: 'asc' | 'desc',
  ): Promise<{ items: SignalementRecord[]; total: number }>;
  findSignalementsByStatutPaged(
    statut: StatutTraitementSignalement,
    page: number,
    size: number,
  ): Promise<{ items: SignalementRecord[]; total: number }>;
  findSignalementsByTypePaged(
    typeEntite: TypeEntiteSignalable,
    page: number,
    size: number,
  ): Promise<{ items: SignalementRecord[]; total: number }>;
  countPendingSignalements(): Promise<number>;

  newId(): string;
}
