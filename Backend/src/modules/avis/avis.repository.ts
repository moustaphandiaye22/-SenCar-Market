import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { AvisRecord, BasicUserRecord, CreateAvisInput } from './avis.models';
import { AvisRepositoryPort } from './avis.repository.port';
import { StatutAvis } from './types/avis.types';

const avisAuteurInclude = Prisma.validator<Prisma.avisInclude>()({
  utilisateur_avis_auteur_idToutilisateur: {
    select: {
      id: true,
      nom: true,
      prenom: true,
    },
  },
});

type AvisWithAuteur = Prisma.avisGetPayload<{
  include: typeof avisAuteurInclude;
}>;

@Injectable()
export class AvisRepository implements AvisRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapAvisRecord(record: AvisWithAuteur): AvisRecord {
    return {
      ...record,
      auteur: record.utilisateur_avis_auteur_idToutilisateur,
    };
  }

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
    const prismaData: Prisma.avisUncheckedCreateInput = {
      id: data.id,
      auteur_id: data.auteur_id,
      cible_utilisateur_id: data.cible_utilisateur_id,
      vehicule_id: data.vehicule_id,
      garage_id: data.garage_id,
      type_avis: data.type_avis,
      transaction_id: data.transaction_id,
      note: data.note,
      commentaire: data.commentaire,
      statut: data.statut,
      created_at: data.created_at,
    };

    return this.prisma.avis.create({
      data: prismaData,
      include: avisAuteurInclude,
    }).then((res) => this.mapAvisRecord(res));
  }

  findAvisById(id: string): Promise<AvisRecord | null> {
    return this.prisma.avis.findUnique({
      where: { id },
      include: avisAuteurInclude,
    }).then((res) => (res ? this.mapAvisRecord(res) : null));
  }

  findAllAvisPaged(statut: StatutAvis, page: number, size: number) {
    const where: Prisma.avisWhereInput = { statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: avisAuteurInclude,
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({
      items: items.map((res) => this.mapAvisRecord(res)),
      total,
    }));
  }

  findAvisByUtilisateurPaged(utilisateurId: string, statut: StatutAvis, page: number, size: number) {
    const where: Prisma.avisWhereInput = { cible_utilisateur_id: utilisateurId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: avisAuteurInclude,
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({
      items: items.map((res) => this.mapAvisRecord(res)),
      total,
    }));
  }

  findAvisByVehiculePaged(vehiculeId: string, statut: StatutAvis, page: number, size: number) {
    const where: Prisma.avisWhereInput = { vehicule_id: vehiculeId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: avisAuteurInclude,
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({
      items: items.map((res) => this.mapAvisRecord(res)),
      total,
    }));
  }

  findAvisByGaragePaged(garageId: string, statut: StatutAvis, page: number, size: number) {
    const where: Prisma.avisWhereInput = { garage_id: garageId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: avisAuteurInclude,
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({
      items: items.map((res) => this.mapAvisRecord(res)),
      total,
    }));
  }

  async getNoteMoyenneUtilisateur(utilisateurId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { cible_utilisateur_id: utilisateurId, statut: 'PUBLIE' },
      _avg: { note: true },
    });
    return result._avg.note ?? null;
  }

  async getNoteMoyenneVehicule(vehiculeId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { vehicule_id: vehiculeId, statut: 'PUBLIE' },
      _avg: { note: true },
    });
    return result._avg.note ?? null;
  }

  async getNoteMoyenneGarage(garageId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { garage_id: garageId, statut: 'PUBLIE' },
      _avg: { note: true },
    });
    return result._avg.note ?? null;
  }

  existsByTransactionAndAuteur(transactionId: string, auteurId: string): Promise<boolean> {
    return this.prisma.avis
      .findFirst({
        where: {
          transaction_id: transactionId,
          auteur_id: auteurId,
          statut: { not: 'SUPPRIMEE' },
        },
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  findByTransactionId(transactionId: string): Promise<Array<{ id: string }>> {
    return this.prisma.avis.findMany({
      where: {
        transaction_id: transactionId,
        statut: { not: 'SUPPRIMEE' },
      },
      select: { id: true },
    });
  }

  updateAvisStatut(id: string, statut: StatutAvis): Promise<AvisRecord> {
    return this.prisma.avis.update({
      where: { id },
      data: { statut },
      include: avisAuteurInclude,
    }).then((res) => this.mapAvisRecord(res));
  }

  newId(): string {
    return randomUUID();
  }
}
