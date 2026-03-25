import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
    const prismaData = {
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
      data: prismaData as any,
      include: {
        utilisateur_avis_auteur_idToutilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    }).then(res => ({
      ...res,
      auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
    })) as unknown as Promise<AvisRecord>;
  }

  findAvisById(id: string): Promise<AvisRecord | null> {
    return this.prisma.avis.findUnique({
      where: { id },
      include: { utilisateur_avis_auteur_idToutilisateur: { select: { id: true, nom: true, prenom: true } } },
    }).then(res => res ? ({
      ...res,
      auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
    }) : null) as any;
  }

  findAllAvisPaged(statut: StatutAvis, page: number, size: number) {
    const where = { statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: { utilisateur_avis_auteur_idToutilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where }),
    ]).then(([items, total]) => ({
      items: items.map(res => ({
        ...res,
        auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
      })),
      total
    }));
  }

  findAvisByUtilisateurPaged(utilisateurId: string, statut: StatutAvis, page: number, size: number) {
    const where = { cible_utilisateur_id: utilisateurId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where: where as any,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: { utilisateur_avis_auteur_idToutilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where: where as any }),
    ]).then(([items, total]) => ({
      items: items.map(res => ({
        ...res,
        auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
      })),
      total
    }));
  }

  findAvisByVehiculePaged(vehiculeId: string, statut: StatutAvis, page: number, size: number) {
    const where = { vehicule_id: vehiculeId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where: where as any,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: { utilisateur_avis_auteur_idToutilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where: where as any }),
    ]).then(([items, total]) => ({
      items: items.map(res => ({
        ...res,
        auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
      })),
      total
    }));
  }

  findAvisByGaragePaged(garageId: string, statut: StatutAvis, page: number, size: number) {
    const where = { garage_id: garageId, statut };
    return Promise.all([
      this.prisma.avis.findMany({
        where: where as any,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: { utilisateur_avis_auteur_idToutilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.avis.count({ where: where as any }),
    ]).then(([items, total]) => ({
      items: items.map(res => ({
        ...res,
        auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
      })),
      total
    }));
  }

  async getNoteMoyenneUtilisateur(utilisateurId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { cible_utilisateur_id: utilisateurId, statut: 'PUBLIE' } as any,
      _avg: { note: true },
    });
    return (result._avg.note as any) ?? null;
  }

  async getNoteMoyenneVehicule(vehiculeId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { vehicule_id: vehiculeId, statut: 'PUBLIE' } as any,
      _avg: { note: true },
    });
    return (result._avg.note as any) ?? null;
  }

  async getNoteMoyenneGarage(garageId: string): Promise<number | null> {
    const result = await this.prisma.avis.aggregate({
      where: { garage_id: garageId, statut: 'PUBLIE' } as any,
      _avg: { note: true },
    });
    return (result._avg.note as any) ?? null;
  }

  existsByTransactionAndAuteur(transactionId: string, auteurId: string): Promise<boolean> {
    return this.prisma.avis
      .findFirst({
        where: {
          transaction_id: transactionId,
          auteur_id: auteurId,
          statut: { not: 'SUPPRIMEE' },
        } as any,
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  findByTransactionId(transactionId: string): Promise<Array<{ id: string }>> {
    return this.prisma.avis.findMany({
      where: {
        transaction_id: transactionId,
        statut: { not: 'SUPPRIMEE' },
      } as any,
      select: { id: true },
    });
  }

  updateAvisStatut(id: string, statut: StatutAvis): Promise<AvisRecord> {
    return this.prisma.avis.update({
      where: { id },
      data: { statut },
      include: { utilisateur_avis_auteur_idToutilisateur: { select: { id: true, nom: true, prenom: true } } },
    }).then(res => ({
      ...res,
      auteur: (res as any).utilisateur_avis_auteur_idToutilisateur
    })) as any;
  }

  newId(): string {
    return randomUUID();
  }
}
