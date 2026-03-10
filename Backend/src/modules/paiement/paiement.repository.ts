import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  CreatePaiementInput,
  CreatePaiementLogInput,
  CreatePortefeuilleInput,
  CreateTransactionInput,
  PaiementLogRecord,
  PaiementRecord,
  PortefeuilleRecord,
  ReservationRecord,
  TransactionRecord,
  UpdatePaiementInput,
  UpdatePortefeuilleInput,
  UserRecord,
} from './paiement.models';
import { PaiementRepositoryPort } from './paiement.repository.port';
import { StatutPaiement } from './types/paiement.types';

@Injectable()
export class PaiementRepository implements PaiementRepositoryPort {
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

  findReservationById(id: string): Promise<ReservationRecord | null> {
    return this.prisma.reservationLocation.findUnique({
      where: { id },
      include: {
        annonceLocation: {
          select: { proprietaireId: true },
        },
      },
    });
  }

  createPaiement(data: CreatePaiementInput): Promise<PaiementRecord> {
    return this.prisma.paiement.create({
      data,
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  updatePaiement(id: string, data: UpdatePaiementInput): Promise<PaiementRecord> {
    return this.prisma.paiement.update({
      where: { id },
      data,
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  findPaiementById(id: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  findPaiementsByUtilisateurId(utilisateurId: string): Promise<PaiementRecord[]> {
    return this.prisma.paiement.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  findPaiementsByReservationId(reservationId: string): Promise<PaiementRecord[]> {
    return this.prisma.paiement.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  findPaiementsByStatut(statut: StatutPaiement): Promise<PaiementRecord[]> {
    return this.prisma.paiement.findMany({
      where: { statut },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  async findAllPaiementsPaged(page: number, size: number): Promise<{ items: PaiementRecord[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.paiement.findMany({
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          utilisateur: { select: { id: true } },
          reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
        },
      }),
      this.prisma.paiement.count(),
    ]);
    return { items, total };
  }

  findPaiementByReferenceExterne(referenceExterne: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findFirst({
      where: { referenceExterne },
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  findPaiementByReferenceTransaction(referenceTransaction: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findFirst({
      where: { referenceTransaction },
      include: {
        utilisateur: { select: { id: true } },
        reservation: { include: { annonceLocation: { select: { proprietaireId: true } } } },
      },
    });
  }

  findPortefeuilleByUtilisateurId(utilisateurId: string): Promise<PortefeuilleRecord | null> {
    return this.prisma.portefeuille.findUnique({ where: { utilisateurId } });
  }

  createPortefeuille(data: CreatePortefeuilleInput): Promise<PortefeuilleRecord> {
    return this.prisma.portefeuille.create({ data });
  }

  updatePortefeuille(id: string, data: UpdatePortefeuilleInput): Promise<PortefeuilleRecord> {
    return this.prisma.portefeuille.update({ where: { id }, data });
  }

  createTransaction(data: CreateTransactionInput): Promise<TransactionRecord> {
    return this.prisma.transactionPortefeuille.create({ data });
  }

  findTransactionById(id: string): Promise<TransactionRecord | null> {
    return this.prisma.transactionPortefeuille.findUnique({ where: { id } });
  }

  findTransactionsByUtilisateurId(utilisateurId: string): Promise<TransactionRecord[]> {
    return this.prisma.transactionPortefeuille.findMany({
      where: {
        portefeuille: {
          utilisateurId,
        },
      },
      orderBy: { dateTransaction: 'desc' },
    });
  }

  hasEscrowReleaseTransaction(utilisateurId: string, referenceExterne: string): Promise<boolean> {
    return this.prisma.transactionPortefeuille
      .findFirst({
        where: {
          typeTransaction: 'ESCROW_RELEASE',
          referenceExterne,
          portefeuille: { utilisateurId },
        },
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  transactionBelongsToUser(transactionId: string, utilisateurId: string): Promise<boolean> {
    return this.prisma.transactionPortefeuille
      .findFirst({
        where: {
          id: transactionId,
          portefeuille: {
            utilisateurId,
          },
        },
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  createPaiementLog(data: CreatePaiementLogInput): Promise<PaiementLogRecord> {
    return this.prisma.paiementLog.create({ data });
  }

  findLogsByPaiementId(paiementId: string): Promise<PaiementLogRecord[]> {
    return this.prisma.paiementLog.findMany({
      where: { paiementId },
      orderBy: { dateAction: 'desc' },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
