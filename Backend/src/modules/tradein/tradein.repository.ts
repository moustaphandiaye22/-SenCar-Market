import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import {
  CreateDemandeInput,
  CreateHistoriqueEstimationInput,
  CreateNotificationInput,
  DemandeRecord,
  UpdateDemandeInput,
  UserRecord,
  VehiculeMini,
} from './tradein.models';
import { TradeInRepositoryPort } from './tradein.repository.port';

@Injectable()
export class TradeInRepository implements TradeInRepositoryPort {
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

  findVehiculeById(id: string): Promise<VehiculeMini | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        marque: { select: { nom: true } },
        modele: { select: { nom: true } },
      },
    }) as unknown as Promise<VehiculeMini | null>;
  }

  createDemande(data: CreateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demande_trade_in.create({
      data: data as unknown as Prisma.demande_trade_inCreateInput,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as unknown as Promise<DemandeRecord>;
  }

  findDemandeById(id: string): Promise<DemandeRecord | null> {
    return this.prisma.demande_trade_in.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as unknown as Promise<DemandeRecord | null>;
  }

  findDemandesPaged(page: number, size: number): Promise<{ items: DemandeRecord[]; total: number }> {
    return Promise.all([
      this.prisma.demande_trade_in.findMany({
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: {
          utilisateur: { select: { id: true, nom: true } },
          vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
            include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
          },
          vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
            include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
          },
        },
      }),
      this.prisma.demande_trade_in.count(),
    ]).then(([items, total]) => ({
      items: items as unknown as DemandeRecord[],
      total,
    }));
  }

  findDemandesByUtilisateurId(utilisateurId: string): Promise<DemandeRecord[]> {
    return this.prisma.demande_trade_in.findMany({
      where: { utilisateur_id: utilisateurId },
      orderBy: { created_at: 'desc' },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as unknown as Promise<DemandeRecord[]>;
  }

  findDemandesByNotifie(estNotifie: boolean): Promise<DemandeRecord[]> {
    return this.prisma.demande_trade_in.findMany({
      where: { est_notifie: estNotifie },
      orderBy: { created_at: 'desc' },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as unknown as Promise<DemandeRecord[]>;
  }

  updateDemande(id: string, data: UpdateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demande_trade_in.update({
      where: { id },
      data: data as unknown as Prisma.demande_trade_inUpdateInput,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as unknown as Promise<DemandeRecord>;
  }

  deleteDemande(id: string): Promise<DemandeRecord> {
    return this.prisma.demande_trade_in.delete({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule_demande_trade_in_vehicule_actuel_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehicule_demande_trade_in_vehicule_souhaite_idTovehicule: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as unknown as Promise<DemandeRecord>;
  }

  createHistoriqueEstimation(data: CreateHistoriqueEstimationInput): Promise<{ id: string }> {
    return this.prisma.historique_estimation.create({
      data: data as unknown as Prisma.historique_estimationCreateInput,
      select: { id: true },
    });
  }

  createNotification(data: CreateNotificationInput): Promise<{ id: string }> {
    return this.prisma.notification.create({
      data: data as unknown as Prisma.notificationCreateInput,
      select: { id: true },
    });
  }

  async findOrCreateVehicule(
    proprietaireId: string,
    marqueNom: string,
    modeleNom: string,
    annee: number,
    kilometrage: number,
  ): Promise<string> {
    const existingMarque = await this.prisma.marque.findFirst({
      where: { nom: marqueNom },
    });
    const marque =
      existingMarque ??
      (await this.prisma.marque.create({
        data: { id: randomUUID(), nom: marqueNom },
      }));

    const existingModele = await this.prisma.modele.findFirst({
      where: { nom: modeleNom, marque_id: marque.id },
    });
    const modele =
      existingModele ??
      (await this.prisma.modele.create({
        data: { id: randomUUID(), nom: modeleNom, marque_id: marque.id },
      }));

    const vehicule = await this.prisma.vehicule.create({
      data: {
        id: randomUUID(),
        proprietaire_id: proprietaireId,
        marque_id: marque.id,
        modele_id: modele.id,
        annee_fabrication: annee,
        kilometrage,
        statut: 'TRADE_IN_DRAFT',
      },
    });

    return vehicule.id;
  }

  newId(): string {
    return randomUUID();
  }
}
