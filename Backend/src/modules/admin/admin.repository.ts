import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { StatutReservation, StatutTransaction, TypeNotification, TypeTransaction } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { AdminUserRecord, TransactionRecord, VehiculeRecord } from './admin.models';
import { AdminRepositoryPort } from './admin.repository.port';

@Injectable()
export class AdminRepository implements AdminRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<AdminUserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { typeUtilisateur: true },
    });
  }

  findTypeUtilisateurByNom(nom: string): Promise<{ id: string; nom: string } | null> {
    return this.prisma.typeUtilisateur.findUnique({ where: { nom } });
  }

  findUsersPaged(page: number, size: number, sortBy: string, sortDir: 'asc' | 'desc') {
    const orderBy = { [this.userSortBy(sortBy)]: sortDir } as { createdAt: 'asc' | 'desc'; updatedAt: 'asc' | 'desc'; email: 'asc' | 'desc' };
    return Promise.all([
      this.prisma.utilisateur.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: { typeUtilisateur: true },
      }),
      this.prisma.utilisateur.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findUserById(id: string): Promise<AdminUserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { typeUtilisateur: true },
    });
  }

  updateUser(id: string, data: Record<string, unknown>): Promise<AdminUserRecord> {
    return this.prisma.utilisateur.update({
      where: { id },
      data,
      include: { typeUtilisateur: true },
    });
  }

  findVehiculesPaged(page: number, size: number, sortBy: string, sortDir: 'asc' | 'desc') {
    const orderBy = { [this.vehiculeSortBy(sortBy)]: sortDir } as { createdAt: 'asc' | 'desc'; updatedAt: 'asc' | 'desc'; prixVente: 'asc' | 'desc'; vues: 'asc' | 'desc' };
    return Promise.all([
      this.prisma.vehicule.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: {
          marque: true,
          modele: true,
          carburant: true,
          boiteVitesse: true,
          proprietaire: true,
          photos: true,
        },
      }),
      this.prisma.vehicule.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findVehiculeById(id: string): Promise<VehiculeRecord | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: true,
        photos: true,
      },
    });
  }

  updateVehicule(id: string, data: Record<string, unknown>): Promise<VehiculeRecord> {
    return this.prisma.vehicule.update({
      where: { id },
      data,
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: true,
        photos: true,
      },
    });
  }

  deleteVehicule(id: string) {
    return this.prisma.vehicule.delete({ where: { id } });
  }

  findTransactionsPaged(page: number, size: number, sortBy: string, sortDir: 'asc' | 'desc') {
    const orderBy = { [this.transactionSortBy(sortBy)]: sortDir } as { createdAt: 'asc' | 'desc'; dateTransaction: 'asc' | 'desc' };
    return Promise.all([
      this.prisma.transactionPortefeuille.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: { portefeuille: { select: { utilisateurId: true } } },
      }),
      this.prisma.transactionPortefeuille.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findTransactionsByUtilisateurId(utilisateurId: string): Promise<TransactionRecord[]> {
    return this.prisma.transactionPortefeuille.findMany({
      where: { portefeuille: { utilisateurId } },
      orderBy: { dateTransaction: 'desc' },
      include: { portefeuille: { select: { utilisateurId: true } } },
    });
  }

  findTransactionById(id: string): Promise<TransactionRecord | null> {
    return this.prisma.transactionPortefeuille.findUnique({
      where: { id },
      include: { portefeuille: { select: { utilisateurId: true } } },
    });
  }

  createTransaction(data: {
    id: string;
    portefeuille: { connect: { id: string } };
    montant: number;
    typeTransaction: TypeTransaction;
    statut: StatutTransaction;
    description: string;
    dateTransaction: Date;
    createdAt: Date;
  }): Promise<TransactionRecord> {
    return this.prisma.transactionPortefeuille.create({
      data,
      include: { portefeuille: { select: { utilisateurId: true } } },
    });
  }

  countUtilisateurs(): Promise<number> {
    return this.prisma.utilisateur.count();
  }

  countVehicules(): Promise<number> {
    return this.prisma.vehicule.count();
  }

  countVehiculesByStatut(statut: string): Promise<number> {
    return this.prisma.vehicule.count({ where: { statut } });
  }

  countReservations(): Promise<number> {
    return this.prisma.reservationLocation.count();
  }

  countReservationsByStatut(statut: StatutReservation): Promise<number> {
    return this.prisma.reservationLocation.count({ where: { statut } });
  }

  countTransactions(): Promise<number> {
    return this.prisma.transactionPortefeuille.count();
  }

  countTransactionsByStatut(statut: StatutTransaction): Promise<number> {
    return this.prisma.transactionPortefeuille.count({ where: { statut } });
  }

  countAbonnements(): Promise<number> {
    return this.prisma.utilisateurAbonnement.count();
  }

  countAbonnementsActifs(now: Date): Promise<number> {
    return this.prisma.utilisateurAbonnement.count({
      where: {
        statut: 'ACTIF',
        dateFin: { gt: now },
      },
    });
  }

  findTransactionsByStatut(statut: StatutTransaction): Promise<TransactionRecord[]> {
    return this.prisma.transactionPortefeuille.findMany({
      where: { statut },
      include: { portefeuille: { select: { utilisateurId: true } } },
    });
  }

  createNotification(data: {
    id: string;
    utilisateur: { connect: { id: string } };
    titre: string;
    message: string;
    type: TypeNotification;
    estLu: boolean;
    dateCreation: Date;
    referenceType?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  findAllUsersIds(): Promise<Array<{ id: string }>> {
    return this.prisma.utilisateur.findMany({ select: { id: true } });
  }

  newId(): string {
    return randomUUID();
  }

  private userSortBy(sortBy: string): 'createdAt' | 'updatedAt' | 'email' {
    if (sortBy === 'updatedAt' || sortBy === 'email') return sortBy;
    return 'createdAt';
  }

  private vehiculeSortBy(sortBy: string): 'createdAt' | 'updatedAt' | 'prixVente' | 'vues' {
    if (sortBy === 'updatedAt' || sortBy === 'prixVente' || sortBy === 'vues') return sortBy;
    return 'createdAt';
  }

  private transactionSortBy(sortBy: string): 'createdAt' | 'dateTransaction' {
    if (sortBy === 'dateTransaction') return sortBy;
    return 'createdAt';
  }
}
