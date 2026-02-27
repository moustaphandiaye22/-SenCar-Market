import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { AvisRecord, BasicUserRecord, CreateAvisInput } from './avis.models';
import { AvisRepositoryPort } from './avis.repository.port';
import { StatutAvis } from './types/avis.types';

@Injectable()
export class AvisRepository implements AvisRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<BasicUserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { email } });
  }

  findUserById(id: string): Promise<BasicUserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { id } });
  }

  findVehiculeById(id: string): Promise<{ id: string } | null> {
    return this.prisma.vehicule.findUnique({ where: { id }, select: { id: true } });
  }

  findGarageById(id: string): Promise<{ id: string } | null> {
    return this.prisma.garage.findUnique({ where: { id }, select: { id: true } });
  }

  createAvis(data: CreateAvisInput): Promise<AvisRecord> {
    return this.prisma.avis.create({
      data,
      include: { auteur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  findAvisById(id: string): Promise<AvisRecord | null> {
    return this.prisma.avis.findUnique({
      where: { id },
      include: { auteur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  findAvisByUtilisateurPaged(utilisateurId: string, statut: StatutAvis, page: number, size: number) {
    const where = { cibleUtilisateurId: utilisateurId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { auteur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findAvisByVehiculePaged(vehiculeId: string, statut: StatutAvis, page: number, size: number) {
    const where = { vehiculeId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { auteur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findAvisByGaragePaged(garageId: string, statut: StatutAvis, page: number, size: number) {
    const where = { garageId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { auteur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  async getNoteMoyenneUtilisateur(utilisateurId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { cibleUtilisateurId: utilisateurId, statut: 'PUBLIE' },
      _avg: { note: true },
    });
    return result._avg.note ?? null;
  }

  async getNoteMoyenneVehicule(vehiculeId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { vehiculeId, statut: 'PUBLIE' },
      _avg: { note: true },
    });
    return result._avg.note ?? null;
  }

  async getNoteMoyenneGarage(garageId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { garageId, statut: 'PUBLIE' },
      _avg: { note: true },
    });
    return result._avg.note ?? null;
  }

  existsByTransactionAndAuteur(transactionId: string, auteurId: string): Promise<boolean> {
    return this.prisma.avis
      .findFirst({
        where: {
          transactionId,
          auteurId,
          statut: { not: 'SUPPRIMEE' },
        },
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  findByTransactionId(transactionId: string): Promise<Array<{ id: string }>> {
    return this.prisma.avis.findMany({
      where: {
        transactionId,
        statut: { not: 'SUPPRIMEE' },
      },
      select: { id: true },
    });
  }

  updateAvisStatut(id: string, statut: StatutAvis): Promise<AvisRecord> {
    return this.prisma.avis.update({
      where: { id },
      data: { statut },
      include: { auteur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
