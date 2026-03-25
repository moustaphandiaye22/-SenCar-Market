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
      include: { type_utilisateur: true },
    }) as unknown as Promise<UserRecord | null>;
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { type_utilisateur: true },
    }) as unknown as Promise<UserRecord | null>;
  }

  findReservationById(id: string): Promise<ReservationRecord | null> {
    return this.prisma.reservation_location.findUnique({
      where: { id },
      include: {
        annonce_location: {
          select: { proprietaire_id: true },
        },
      },
    }) as unknown as Promise<ReservationRecord | null>;
  }

  async updateReservationStatus(id: string, statut: string): Promise<void> {
    await this.prisma.reservation_location.update({
      where: { id },
      data: { statut: statut as any },
    });
  }

  createPaiement(data: CreatePaiementInput): Promise<PaiementRecord> {
    return this.prisma.paiement.create({
      data: data as any,
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord>;
  }

  updatePaiement(id: string, data: UpdatePaiementInput): Promise<PaiementRecord> {
    return this.prisma.paiement.update({
      where: { id },
      data: data as any,
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord>;
  }

  findPaiementById(id: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord | null>;
  }

  findPaiementsByUtilisateurId(utilisateurId: string): Promise<PaiementRecord[]> {
    return this.prisma.paiement.findMany({
      where: { utilisateur_id: utilisateurId },
      orderBy: { created_at: 'desc' },
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord[]>;
  }

  findPaiementsByReservationId(reservationId: string): Promise<PaiementRecord[]> {
    return this.prisma.paiement.findMany({
      where: { reservation_id: reservationId },
      orderBy: { created_at: 'desc' },
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord[]>;
  }

  findPaiementsByStatut(statut: StatutPaiement): Promise<PaiementRecord[]> {
    return this.prisma.paiement.findMany({
      where: { statut },
      orderBy: { created_at: 'desc' },
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord[]>;
  }

  async findAllPaiementsPaged(page: number, size: number): Promise<{ items: PaiementRecord[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.paiement.findMany({
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: {
          utilisateur: { select: { id: true } },
          reservation_location_paiement_reservation_idToreservation_location: {
            include: { annonce_location: { select: { proprietaire_id: true } } },
          },
        },
      }),
      this.prisma.paiement.count(),
    ]);
    return {
      items: items as unknown as PaiementRecord[],
      total,
    };
  }

  findPaiementByReferenceExterne(referenceExterne: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findFirst({
      where: { reference_externe: referenceExterne },
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord | null>;
  }

  findPaiementByReferenceTransaction(referenceTransaction: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findFirst({
      where: { reference_transaction: referenceTransaction },
      include: {
        utilisateur: { select: { id: true } },
        reservation_location_paiement_reservation_idToreservation_location: {
          include: { annonce_location: { select: { proprietaire_id: true } } },
        },
      },
    }) as unknown as Promise<PaiementRecord | null>;
  }

  findPortefeuilleByUtilisateurId(utilisateurId: string): Promise<PortefeuilleRecord | null> {
    return this.prisma.portefeuille.findUnique({
      where: { utilisateur_id: utilisateurId },
    }) as unknown as Promise<PortefeuilleRecord | null>;
  }

  createPortefeuille(data: CreatePortefeuilleInput): Promise<PortefeuilleRecord> {
    return this.prisma.portefeuille.create({
      data: data as any,
    }) as unknown as Promise<PortefeuilleRecord>;
  }

  updatePortefeuille(id: string, data: UpdatePortefeuilleInput): Promise<PortefeuilleRecord> {
    return this.prisma.portefeuille.update({
      where: { id },
      data: data as any,
    }) as unknown as Promise<PortefeuilleRecord>;
  }

  createTransaction(data: CreateTransactionInput): Promise<TransactionRecord> {
    return this.prisma.transaction_portefeuille.create({
      data: data as any,
    }) as unknown as Promise<TransactionRecord>;
  }

  findTransactionById(id: string): Promise<TransactionRecord | null> {
    return this.prisma.transaction_portefeuille.findUnique({
      where: { id },
    }) as unknown as Promise<TransactionRecord | null>;
  }

  findTransactionsByUtilisateurId(utilisateurId: string): Promise<TransactionRecord[]> {
    return this.prisma.transaction_portefeuille.findMany({
      where: {
        portefeuille: {
          utilisateur_id: utilisateurId,
        },
      },
      orderBy: { date_transaction: 'desc' },
    }) as unknown as Promise<TransactionRecord[]>;
  }

  hasEscrowReleaseTransaction(utilisateurId: string, referenceExterne: string): Promise<boolean> {
    return this.prisma.transaction_portefeuille
      .findFirst({
        where: {
          type_transaction: 'ESCROW_RELEASE',
          reference_externe: referenceExterne,
          portefeuille: { utilisateur_id: utilisateurId },
        },
        select: { id: true },
      })
      .then((value) => Boolean(value));
  }

  transactionBelongsToUser(transactionId: string, utilisateurId: string): Promise<boolean> {
    return this.prisma.transaction_portefeuille
      .findFirst({
        where: {
          id: transactionId,
          portefeuille: {
            utilisateur_id: utilisateurId,
          },
        },
        select: { id: true },
      })
      .then((value) => Boolean(value));
  }

  createPaiementLog(data: CreatePaiementLogInput): Promise<PaiementLogRecord> {
    return this.prisma.paiement_log.create({
      data: data as any,
    }) as unknown as Promise<PaiementLogRecord>;
  }

  findLogsByPaiementId(paiementId: string): Promise<PaiementLogRecord[]> {
    return this.prisma.paiement_log.findMany({
      where: { paiement_id: paiementId },
      orderBy: { date_action: 'desc' },
    }) as unknown as Promise<PaiementLogRecord[]>;
  }

  newId(): string {
    return randomUUID();
  }
}
