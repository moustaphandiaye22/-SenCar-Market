import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import {
  CreateNotificationInput,
  CreateSignalementInput,
  NotificationRecord,
  SignalementRecord,
  UpdateNotificationInput,
  UpdateSignalementInput,
  UserRecord,
} from './notification.models';
import { NotificationRepositoryPort } from './notification.repository.port';
import { StatutTraitementSignalement, TypeEntiteSignalable, TypeNotification } from './types/notification.types';

const signalementInclude = Prisma.validator<Prisma.signalementInclude>()({
  utilisateur_signalement_utilisateur_idToutilisateur: {
    select: { nom: true, prenom: true },
  },
});

type SignalementWithUtilisateur = Prisma.signalementGetPayload<{
  include: typeof signalementInclude;
}>;

@Injectable()
export class NotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapSignalement(record: SignalementWithUtilisateur): SignalementRecord {
    return {
      ...record,
      utilisateur: record.utilisateur_signalement_utilisateur_idToutilisateur,
    };
  }

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { type_utilisateur: true },
    }) as unknown as Promise<UserRecord | null>;
  }

  createNotification(data: CreateNotificationInput): Promise<NotificationRecord> {
    return this.prisma.notification.create({
      data: data as Prisma.notificationUncheckedCreateInput,
    }) as unknown as Promise<NotificationRecord>;
  }

  updateNotification(id: string, data: UpdateNotificationInput): Promise<NotificationRecord> {
    return this.prisma.notification.update({
      where: { id },
      data: data as Prisma.notificationUncheckedUpdateInput,
    }) as unknown as Promise<NotificationRecord>;
  }

  findNotificationById(id: string): Promise<NotificationRecord | null> {
    return this.prisma.notification.findUnique({ where: { id } }) as unknown as Promise<NotificationRecord | null>;
  }

  findNotificationsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    return Promise.all([
      this.prisma.notification.findMany({
        where: { utilisateur_id: utilisateurId },
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where: { utilisateur_id: utilisateurId } }),
    ]).then(([items, total]) => ({ items: items as unknown as NotificationRecord[], total }));
  }

  findUnreadNotificationsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    const where = { utilisateur_id: utilisateurId, est_lu: false };
    return Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]).then(([items, total]) => ({ items: items as unknown as NotificationRecord[], total }));
  }

  findNotificationsByTypePaged(
    utilisateurId: string,
    type: TypeNotification,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    const where = { utilisateur_id: utilisateurId, type };
    return Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]).then(([items, total]) => ({ items: items as unknown as NotificationRecord[], total }));
  }

  findUnreadNotificationsByUtilisateur(utilisateurId: string): Promise<NotificationRecord[]> {
    return this.prisma.notification.findMany({
      where: { utilisateur_id: utilisateurId, est_lu: false },
      orderBy: { created_at: 'desc' },
    }) as unknown as Promise<NotificationRecord[]>;
  }

  countUnreadByUtilisateur(utilisateurId: string): Promise<number> {
    return this.prisma.notification.count({ where: { utilisateur_id: utilisateurId, est_lu: false } });
  }

  deleteNotification(id: string): Promise<NotificationRecord> {
    return this.prisma.notification.delete({ where: { id } }) as unknown as Promise<NotificationRecord>;
  }

  deleteAllNotifications(utilisateurId: string): Promise<{ count: number }> {
    return this.prisma.notification.deleteMany({ where: { utilisateur_id: utilisateurId } });
  }

  createSignalement(data: CreateSignalementInput): Promise<SignalementRecord> {
    return this.prisma.signalement.create({
      data: data as Prisma.signalementUncheckedCreateInput,
      include: signalementInclude,
    }).then((record) => this.mapSignalement(record));
  }

  updateSignalement(id: string, data: UpdateSignalementInput): Promise<SignalementRecord> {
    return this.prisma.signalement.update({
      where: { id },
      data: data as Prisma.signalementUncheckedUpdateInput,
      include: signalementInclude,
    }).then((record) => this.mapSignalement(record));
  }

  findSignalementById(id: string): Promise<SignalementRecord | null> {
    return this.prisma.signalement.findUnique({
      where: { id },
      include: signalementInclude,
    }).then((record) => (record ? this.mapSignalement(record) : null));
  }

  findSignalementsPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: 'asc' | 'desc',
  ): Promise<{ items: SignalementRecord[]; total: number }> {
    const mappedSortBy = sortBy === 'dateSignalement' ? 'created_at' : 'created_at';
    const orderBy = { [mappedSortBy]: sortDir } as { created_at: 'asc' | 'desc' };

    return Promise.all([
      this.prisma.signalement.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: signalementInclude,
      }),
      this.prisma.signalement.count(),
    ]).then(([items, total]) => ({ items: items.map((item) => this.mapSignalement(item)), total }));
  }

  findSignalementsByStatutPaged(
    statut: StatutTraitementSignalement,
    page: number,
    size: number,
  ): Promise<{ items: SignalementRecord[]; total: number }> {
    const where = { statut_traitement: statut };
    return Promise.all([
      this.prisma.signalement.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: signalementInclude,
      }),
      this.prisma.signalement.count({ where }),
    ]).then(([items, total]) => ({ items: items.map((item) => this.mapSignalement(item)), total }));
  }

  findSignalementsByTypePaged(
    typeEntite: TypeEntiteSignalable,
    page: number,
    size: number,
  ): Promise<{ items: SignalementRecord[]; total: number }> {
    const where = { type_entite: typeEntite };
    return Promise.all([
      this.prisma.signalement.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: signalementInclude,
      }),
      this.prisma.signalement.count({ where }),
    ]).then(([items, total]) => ({ items: items.map((item) => this.mapSignalement(item)), total }));
  }

  countPendingSignalements(): Promise<number> {
    return this.prisma.signalement.count({ where: { statut_traitement: 'EN_ATTENTE' } });
  }

  newId(): string {
    return randomUUID();
  }
}
