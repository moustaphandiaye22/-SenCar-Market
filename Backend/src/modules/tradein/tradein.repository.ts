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
      include: { typeUtilisateur: true },
    });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { typeUtilisateur: true },
    });
  }

  findVehiculeById(id: string): Promise<VehiculeMini | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        marque: { select: { nom: true } },
        modele: { select: { nom: true } },
      },
    });
  }

  createDemande(data: CreateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demandeTradeIn.create({
      data: data as unknown as Prisma.DemandeTradeInCreateInput,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehiculeActuel: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehiculeSouhaite: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as Promise<DemandeRecord>;
  }

  findDemandeById(id: string): Promise<DemandeRecord | null> {
    return this.prisma.demandeTradeIn.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehiculeActuel: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehiculeSouhaite: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    });
  }

  findDemandesPaged(page: number, size: number): Promise<{ items: DemandeRecord[]; total: number }> {
    return Promise.all([
      this.prisma.demandeTradeIn.findMany({
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          utilisateur: { select: { id: true, nom: true } },
          vehiculeActuel: {
            include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
          },
          vehiculeSouhaite: {
            include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
          },
        },
      }),
      this.prisma.demandeTradeIn.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findDemandesByUtilisateurId(utilisateurId: string): Promise<DemandeRecord[]> {
    return this.prisma.demandeTradeIn.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehiculeActuel: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehiculeSouhaite: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    });
  }

  findDemandesByNotifie(estNotifie: boolean): Promise<DemandeRecord[]> {
    return this.prisma.demandeTradeIn.findMany({
      where: { estNotifie },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehiculeActuel: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehiculeSouhaite: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    });
  }

  updateDemande(id: string, data: UpdateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demandeTradeIn.update({
      where: { id },
      data: data as unknown as Prisma.DemandeTradeInUpdateInput,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehiculeActuel: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehiculeSouhaite: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as Promise<DemandeRecord>;
  }

  deleteDemande(id: string): Promise<DemandeRecord> {
    return this.prisma.demandeTradeIn.delete({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehiculeActuel: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
        vehiculeSouhaite: {
          include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
        },
      },
    }) as Promise<DemandeRecord>;
  }

  createHistoriqueEstimation(data: CreateHistoriqueEstimationInput): Promise<{ id: string }> {
    return this.prisma.historiqueEstimation.create({
      data: data as unknown as Prisma.HistoriqueEstimationCreateInput,
      select: { id: true },
    });
  }

  createNotification(data: CreateNotificationInput): Promise<{ id: string }> {
    return this.prisma.notification.create({
      data: data as unknown as Prisma.NotificationCreateInput,
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
        data: { nom: marqueNom },
      }));

    const existingModele = await this.prisma.modele.findFirst({
      where: { nom: modeleNom, marqueId: marque.id },
    });
    const modele =
      existingModele ??
      (await this.prisma.modele.create({
        data: { nom: modeleNom, marqueId: marque.id },
      }));

    const vehicule = await this.prisma.vehicule.create({
      data: {
        id: randomUUID(),
        proprietaireId,
        marqueId: marque.id,
        modeleId: modele.id,
        anneeFabrication: annee,
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
