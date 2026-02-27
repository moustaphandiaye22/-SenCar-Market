import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  AbonnementRecord,
  BoostAnnonceRecord,
  CreateAbonnementInput,
  CreateBoostInput,
  CreateUtilisateurAbonnementInput,
  UpdateAbonnementInput,
  UpdateBoostInput,
  UpdateUtilisateurAbonnementInput,
  UserRecord,
  UtilisateurAbonnementRecord,
} from './abonnement.models';
import { AbonnementRepositoryPort } from './abonnement.repository.port';

@Injectable()
export class AbonnementRepository implements AbonnementRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { typeUtilisateur: true },
    });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { typeUtilisateur: true },
    });
  }

  createAbonnement(data: CreateAbonnementInput): Promise<AbonnementRecord> {
    return this.prisma.abonnement.create({ data });
  }

  updateAbonnement(id: string, data: UpdateAbonnementInput): Promise<AbonnementRecord> {
    return this.prisma.abonnement.update({ where: { id }, data });
  }

  findAbonnementById(id: string): Promise<AbonnementRecord | null> {
    return this.prisma.abonnement.findUnique({ where: { id } });
  }

  findAllAbonnements(): Promise<AbonnementRecord[]> {
    return this.prisma.abonnement.findMany({
      orderBy: { prixMensuel: 'asc' },
    });
  }

  createUtilisateurAbonnement(data: CreateUtilisateurAbonnementInput): Promise<UtilisateurAbonnementRecord> {
    return this.prisma.utilisateurAbonnement.create({
      data,
      include: {
        abonnement: {
          select: { id: true, nom: true, nombreAnnonces: true },
        },
      },
    });
  }

  updateUtilisateurAbonnement(id: string, data: UpdateUtilisateurAbonnementInput): Promise<UtilisateurAbonnementRecord> {
    return this.prisma.utilisateurAbonnement.update({
      where: { id },
      data,
      include: {
        abonnement: {
          select: { id: true, nom: true, nombreAnnonces: true },
        },
      },
    });
  }

  findActiveSubscription(utilisateurId: string, now: Date): Promise<UtilisateurAbonnementRecord | null> {
    return this.prisma.utilisateurAbonnement.findFirst({
      where: {
        utilisateurId,
        statut: 'ACTIF',
        dateFin: { gt: now },
      },
      orderBy: { dateFin: 'desc' },
      include: {
        abonnement: {
          select: { id: true, nom: true, nombreAnnonces: true },
        },
      },
    });
  }

  findPendingSubscription(utilisateurId: string): Promise<UtilisateurAbonnementRecord | null> {
    return this.prisma.utilisateurAbonnement.findFirst({
      where: {
        utilisateurId,
        statut: 'EN_ATTENTE',
      },
      orderBy: { dateDebut: 'desc' },
      include: {
        abonnement: {
          select: { id: true, nom: true, nombreAnnonces: true },
        },
      },
    });
  }

  findSubscriptionsByUtilisateurPaged(utilisateurId: string, page: number, size: number): Promise<{ items: UtilisateurAbonnementRecord[]; total: number }> {
    return Promise.all([
      this.prisma.utilisateurAbonnement.findMany({
        where: { utilisateurId },
        skip: page * size,
        take: size,
        orderBy: { dateDebut: 'desc' },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombreAnnonces: true },
          },
        },
      }),
      this.prisma.utilisateurAbonnement.count({ where: { utilisateurId } }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findExpiredActiveSubscriptions(now: Date): Promise<UtilisateurAbonnementRecord[]> {
    return this.prisma.utilisateurAbonnement.findMany({
      where: {
        statut: 'ACTIF',
        dateFin: { lte: now },
      },
      include: {
        abonnement: {
          select: { id: true, nom: true, nombreAnnonces: true },
        },
      },
    });
  }

  findExpiringSoon(now: Date, endDate: Date): Promise<UtilisateurAbonnementRecord[]> {
    return this.prisma.utilisateurAbonnement.findMany({
      where: {
        statut: 'ACTIF',
        dateFin: { gt: now, lte: endDate },
      },
      include: {
        abonnement: {
          select: { id: true, nom: true, nombreAnnonces: true },
        },
      },
    });
  }

  createBoost(data: CreateBoostInput): Promise<BoostAnnonceRecord> {
    return this.prisma.boostAnnonce.create({ data });
  }

  updateBoost(id: string, data: UpdateBoostInput): Promise<BoostAnnonceRecord> {
    return this.prisma.boostAnnonce.update({ where: { id }, data });
  }

  deleteBoost(id: string): Promise<BoostAnnonceRecord> {
    return this.prisma.boostAnnonce.delete({ where: { id } });
  }

  findBoostById(id: string): Promise<BoostAnnonceRecord | null> {
    return this.prisma.boostAnnonce.findUnique({ where: { id } });
  }

  findBoostsByAnnonceLocationId(annonceLocationId: string, now: Date): Promise<BoostAnnonceRecord[]> {
    return this.prisma.boostAnnonce.findMany({
      where: {
        annonceLocationId,
        dateFin: { gt: now },
      },
      orderBy: { dateFin: 'desc' },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
