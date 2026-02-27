import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

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

@Injectable()
export class NotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { typeUtilisateur: true },
    });
  }

  createNotification(data: CreateNotificationInput): Promise<NotificationRecord> {
    return this.prisma.notification.create({ data });
  }

  updateNotification(id: string, data: UpdateNotificationInput): Promise<NotificationRecord> {
    return this.prisma.notification.update({ where: { id }, data });
  }

  findNotificationById(id: string): Promise<NotificationRecord | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  findNotificationsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    return Promise.all([
      this.prisma.notification.findMany({
        where: { utilisateurId },
        skip: page * size,
        take: size,
        orderBy: { dateCreation: 'desc' },
      }),
      this.prisma.notification.count({ where: { utilisateurId } }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findUnreadNotificationsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    const where = { utilisateurId, estLu: false };
    return Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { dateCreation: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findNotificationsByTypePaged(
    utilisateurId: string,
    type: TypeNotification,
    page: number,
    size: number,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    const where = { utilisateurId, type };
    return Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { dateCreation: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findUnreadNotificationsByUtilisateur(utilisateurId: string): Promise<NotificationRecord[]> {
    return this.prisma.notification.findMany({
      where: { utilisateurId, estLu: false },
      orderBy: { dateCreation: 'desc' },
    });
  }

  countUnreadByUtilisateur(utilisateurId: string): Promise<number> {
    return this.prisma.notification.count({ where: { utilisateurId, estLu: false } });
  }

  deleteNotification(id: string): Promise<NotificationRecord> {
    return this.prisma.notification.delete({ where: { id } });
  }

  deleteAllNotifications(utilisateurId: string): Promise<{ count: number }> {
    return this.prisma.notification.deleteMany({ where: { utilisateurId } });
  }

  createSignalement(data: CreateSignalementInput): Promise<SignalementRecord> {
    return this.prisma.signalement.create({
      data,
      include: { utilisateur: { select: { nom: true, prenom: true } } },
    });
  }

  updateSignalement(id: string, data: UpdateSignalementInput): Promise<SignalementRecord> {
    return this.prisma.signalement.update({
      where: { id },
      data,
      include: { utilisateur: { select: { nom: true, prenom: true } } },
    });
  }

  findSignalementById(id: string): Promise<SignalementRecord | null> {
    return this.prisma.signalement.findUnique({
      where: { id },
      include: { utilisateur: { select: { nom: true, prenom: true } } },
    });
  }

  findSignalementsPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: 'asc' | 'desc',
  ): Promise<{ items: SignalementRecord[]; total: number }> {
    const mappedSortBy = sortBy === 'dateSignalement' ? 'dateSignalement' : 'dateSignalement';
    const orderBy = { [mappedSortBy]: sortDir } as { dateSignalement: 'asc' | 'desc' };

    return Promise.all([
      this.prisma.signalement.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: { utilisateur: { select: { nom: true, prenom: true } } },
      }),
      this.prisma.signalement.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findSignalementsByStatutPaged(
    statut: StatutTraitementSignalement,
    page: number,
    size: number,
  ): Promise<{ items: SignalementRecord[]; total: number }> {
    const where = { statutTraitement: statut };
    return Promise.all([
      this.prisma.signalement.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { dateSignalement: 'desc' },
        include: { utilisateur: { select: { nom: true, prenom: true } } },
      }),
      this.prisma.signalement.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findSignalementsByTypePaged(
    typeEntite: TypeEntiteSignalable,
    page: number,
    size: number,
  ): Promise<{ items: SignalementRecord[]; total: number }> {
    const where = { typeEntite };
    return Promise.all([
      this.prisma.signalement.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { dateSignalement: 'desc' },
        include: { utilisateur: { select: { nom: true, prenom: true } } },
      }),
      this.prisma.signalement.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  countPendingSignalements(): Promise<number> {
    return this.prisma.signalement.count({ where: { statutTraitement: 'EN_ATTENTE' } });
  }

  newId(): string {
    return randomUUID();
  }
}
