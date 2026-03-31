import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  CreateGarageInput,
  CreateGarageServiceAssociationInput,
  CreateServiceInput,
  GarageRecord,
  GarageServiceAssociationRecord,
  ServiceGarageRecord,
  UpdateGarageInput,
  UserRecord,
  CreateRendezVousInput,
  RendezVousServiceRecord,
} from './garage.models';
import { GarageRepositoryPort } from './garage.repository.port';
import { StatutValidationGarage } from './types/garage.types';

@Injectable()
export class GarageRepository implements GarageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { type_utilisateur: true },
    });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { type_utilisateur: true },
    });
  }

  createGarage(data: CreateGarageInput): Promise<GarageRecord> {
    // Create the garage first, then fetch it with the proprietaire relation
    return this.prisma.garage.create({ data }).then((garage) =>
      this.prisma.garage.findUnique({
        where: { id: garage.id },
        include: { utilisateur: { select: { id: true, nom: true } } },
      }) as Promise<GarageRecord>,
    );
  }

  updateGarage(id: string, data: UpdateGarageInput): Promise<GarageRecord> {
    // Update the garage first, then fetch it with the proprietaire relation
    return this.prisma.garage.update({ where: { id }, data }).then((garage) =>
      this.prisma.garage.findUnique({
        where: { id: garage.id },
        include: { utilisateur: { select: { id: true, nom: true } } },
      }) as Promise<GarageRecord>,
    );
  }

  findGarageById(id: string): Promise<GarageRecord | null> {
    return this.prisma.garage.findUnique({
      where: { id },
      include: { utilisateur: { select: { id: true, nom: true } } },
    });
  }

  deleteGarage(id: string): Promise<GarageRecord> {
    return this.prisma.garage.delete({
      where: { id },
      include: { utilisateur: { select: { id: true, nom: true } } },
    });
  }

  findGaragesPaged(page: number, size: number): Promise<{ items: GarageRecord[]; total: number }> {
    return Promise.all([
      this.prisma.garage.findMany({
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: { utilisateur: { select: { id: true, nom: true } } },
      }),
      this.prisma.garage.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findGaragesByStatutPaged(statut: StatutValidationGarage, page: number, size: number): Promise<{ items: GarageRecord[]; total: number }> {
    const where = { statut_validation: statut };
    return Promise.all([
      this.prisma.garage.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: 'desc' },
        include: { utilisateur: { select: { id: true, nom: true } } },
      }),
      this.prisma.garage.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findGaragesByProprietaireId(proprietaireId: string): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: { utilisateur_id: proprietaireId },
      orderBy: { created_at: 'desc' },
      include: { utilisateur: { select: { id: true, nom: true } } },
    });
  }

  findActiveByVille(ville: string): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: { ville, statut_validation: 'ACTIF' },
      orderBy: { created_at: 'desc' },
      include: { utilisateur: { select: { id: true, nom: true } } },
    });
  }

  findByLocation(minLat: number, maxLat: number, minLon: number, maxLon: number): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLon, lte: maxLon },
        statut_validation: 'ACTIF',
      },
      include: { utilisateur: { select: { id: true, nom: true } } },
    });
  }

  searchGarages(query: string): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: {
        statut_validation: 'ACTIF',
        OR: [
          { nom: { contains: query, mode: 'insensitive' } },
          { adresse: { contains: query, mode: 'insensitive' } },
          { ville: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { utilisateur: { select: { id: true, nom: true } } },
    });
  }

  createService(data: CreateServiceInput): Promise<ServiceGarageRecord> {
    return this.prisma.service_garage.create({ data });
  }

  findServiceById(id: string): Promise<ServiceGarageRecord | null> {
    return this.prisma.service_garage.findUnique({ where: { id } });
  }

  findServicesActifs(): Promise<ServiceGarageRecord[]> {
    return this.prisma.service_garage.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
    });
  }

  findAssociationByGarageAndService(garageId: string, serviceId: string): Promise<GarageServiceAssociationRecord | null> {
    return this.prisma.garage_service_association.findFirst({
      where: { garage_id: garageId, service_id: serviceId },
      include: {
        garage: { select: { id: true, nom: true } },
        service_garage: { select: { id: true, nom: true } },
      },
    });
  }

  createAssociation(data: CreateGarageServiceAssociationInput): Promise<GarageServiceAssociationRecord> {
    return this.prisma.garage_service_association.create({
      data,
      include: {
        garage: { select: { id: true, nom: true } },
        service_garage: { select: { id: true, nom: true } },
      },
    });
  }

  findServicesByGarageId(garageId: string): Promise<GarageServiceAssociationRecord[]> {
    return this.prisma.garage_service_association.findMany({
      where: { garage_id: garageId, actif: true },
      include: {
        garage: { select: { id: true, nom: true } },
        service_garage: { select: { id: true, nom: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  findAssociationsByGarageId(garageId: string): Promise<Array<{ id: string }>> {
    return this.prisma.garage_service_association.findMany({
      where: { garage_id: garageId },
      select: { id: true },
    });
  }

  deleteAssociation(id: string): Promise<void> {
    return this.prisma.garage_service_association.delete({ where: { id } }).then(() => undefined);
  }

  deleteManyAssociations(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return Promise.resolve();
    }
    return this.prisma.garage_service_association.deleteMany({ where: { id: { in: ids } } }).then(() => undefined);
  }

  createRendezVous(data: CreateRendezVousInput): Promise<RendezVousServiceRecord> {
    return this.prisma.rendez_vous_service.create({
      data,
      include: {
        garage: { select: { id: true, nom: true, utilisateur_id: true } },
        client: { select: { id: true, nom: true, prenom: true, email: true } },
        service: { select: { id: true, nom: true } },
      },
    }) as unknown as Promise<RendezVousServiceRecord>;
  }

  findRendezVousById(id: string): Promise<RendezVousServiceRecord | null> {
    return this.prisma.rendez_vous_service.findUnique({
      where: { id },
      include: {
        garage: { select: { id: true, nom: true, utilisateur_id: true } },
        client: { select: { id: true, nom: true, prenom: true, email: true } },
        service: { select: { id: true, nom: true } },
      },
    }) as unknown as Promise<RendezVousServiceRecord | null>;
  }

  findRendezVousByClient(clientId: string): Promise<RendezVousServiceRecord[]> {
    return this.prisma.rendez_vous_service.findMany({
      where: { client_id: clientId },
      include: {
        garage: { select: { id: true, nom: true, utilisateur_id: true } },
        client: { select: { id: true, nom: true, prenom: true, email: true } },
        service: { select: { id: true, nom: true } },
      },
      orderBy: { date_rendez_vous: 'desc' },
    }) as unknown as Promise<RendezVousServiceRecord[]>;
  }

  findRendezVousByGarage(garageId: string): Promise<RendezVousServiceRecord[]> {
    return this.prisma.rendez_vous_service.findMany({
      where: { garage_id: garageId },
      include: {
        garage: { select: { id: true, nom: true, utilisateur_id: true } },
        client: { select: { id: true, nom: true, prenom: true, email: true } },
        service: { select: { id: true, nom: true } },
      },
      orderBy: { date_rendez_vous: 'desc' },
    }) as unknown as Promise<RendezVousServiceRecord[]>;
  }

  updateRendezVousStatut(id: string, statut: string): Promise<RendezVousServiceRecord> {
    return this.prisma.rendez_vous_service.update({
      where: { id },
      data: { statut },
      include: {
        garage: { select: { id: true, nom: true, utilisateur_id: true } },
        client: { select: { id: true, nom: true, prenom: true, email: true } },
        service: { select: { id: true, nom: true } },
      },
    }) as unknown as Promise<RendezVousServiceRecord>;
  }

  newId(): string {
    return randomUUID();
  }
}
