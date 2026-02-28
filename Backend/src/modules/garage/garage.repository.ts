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
} from './garage.models';
import { GarageRepositoryPort } from './garage.repository.port';
import { StatutValidationGarage } from './types/garage.types';

@Injectable()
export class GarageRepository implements GarageRepositoryPort {
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

  createGarage(data: CreateGarageInput): Promise<GarageRecord> {
    // Create the garage first, then fetch it with the proprietaire relation
    return this.prisma.garage.create({ data }).then((garage) =>
      this.prisma.garage.findUnique({
        where: { id: garage.id },
        include: { proprietaire: { select: { id: true, nom: true } } },
      }) as Promise<GarageRecord>,
    );
  }

  updateGarage(id: string, data: UpdateGarageInput): Promise<GarageRecord> {
    // Update the garage first, then fetch it with the proprietaire relation
    return this.prisma.garage.update({ where: { id }, data }).then((garage) =>
      this.prisma.garage.findUnique({
        where: { id: garage.id },
        include: { proprietaire: { select: { id: true, nom: true } } },
      }) as Promise<GarageRecord>,
    );
  }

  findGarageById(id: string): Promise<GarageRecord | null> {
    return this.prisma.garage.findUnique({
      where: { id },
      include: { proprietaire: { select: { id: true, nom: true } } },
    });
  }

  deleteGarage(id: string): Promise<GarageRecord> {
    return this.prisma.garage.delete({
      where: { id },
      include: { proprietaire: { select: { id: true, nom: true } } },
    });
  }

  findGaragesPaged(page: number, size: number): Promise<{ items: GarageRecord[]; total: number }> {
    return Promise.all([
      this.prisma.garage.findMany({
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { proprietaire: { select: { id: true, nom: true } } },
      }),
      this.prisma.garage.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findGaragesByStatutPaged(statut: StatutValidationGarage, page: number, size: number): Promise<{ items: GarageRecord[]; total: number }> {
    const where = { statutValidation: statut };
    return Promise.all([
      this.prisma.garage.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { proprietaire: { select: { id: true, nom: true } } },
      }),
      this.prisma.garage.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findGaragesByProprietaireId(proprietaireId: string): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: { utilisateurId: proprietaireId },
      orderBy: { createdAt: 'desc' },
      include: { proprietaire: { select: { id: true, nom: true } } },
    });
  }

  findActiveByVille(ville: string): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: { ville, statutValidation: 'ACTIF' },
      orderBy: { createdAt: 'desc' },
      include: { proprietaire: { select: { id: true, nom: true } } },
    });
  }

  findByLocation(minLat: number, maxLat: number, minLon: number, maxLon: number): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLon, lte: maxLon },
        statutValidation: 'ACTIF',
      },
      include: { proprietaire: { select: { id: true, nom: true } } },
    });
  }

  searchGarages(query: string): Promise<GarageRecord[]> {
    return this.prisma.garage.findMany({
      where: {
        statutValidation: 'ACTIF',
        OR: [
          { nom: { contains: query, mode: 'insensitive' } },
          { adresse: { contains: query, mode: 'insensitive' } },
          { ville: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { proprietaire: { select: { id: true, nom: true } } },
    });
  }

  createService(data: CreateServiceInput): Promise<ServiceGarageRecord> {
    return this.prisma.serviceGarage.create({ data });
  }

  findServiceById(id: string): Promise<ServiceGarageRecord | null> {
    return this.prisma.serviceGarage.findUnique({ where: { id } });
  }

  findServicesActifs(): Promise<ServiceGarageRecord[]> {
    return this.prisma.serviceGarage.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
    });
  }

  findAssociationByGarageAndService(garageId: string, serviceId: string): Promise<GarageServiceAssociationRecord | null> {
    return this.prisma.garageServiceAssociation.findFirst({
      where: { garageId, serviceId },
      include: {
        garage: { select: { id: true, nom: true } },
        service: { select: { id: true, nom: true } },
      },
    });
  }

  createAssociation(data: CreateGarageServiceAssociationInput): Promise<GarageServiceAssociationRecord> {
    return this.prisma.garageServiceAssociation.create({
      data,
      include: {
        garage: { select: { id: true, nom: true } },
        service: { select: { id: true, nom: true } },
      },
    });
  }

  findServicesByGarageId(garageId: string): Promise<GarageServiceAssociationRecord[]> {
    return this.prisma.garageServiceAssociation.findMany({
      where: { garageId, actif: true },
      include: {
        garage: { select: { id: true, nom: true } },
        service: { select: { id: true, nom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAssociationsByGarageId(garageId: string): Promise<Array<{ id: string }>> {
    return this.prisma.garageServiceAssociation.findMany({
      where: { garageId },
      select: { id: true },
    });
  }

  deleteAssociation(id: string): Promise<void> {
    return this.prisma.garageServiceAssociation.delete({ where: { id } }).then(() => undefined);
  }

  deleteManyAssociations(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return Promise.resolve();
    }
    return this.prisma.garageServiceAssociation.deleteMany({ where: { id: { in: ids } } }).then(() => undefined);
  }

  newId(): string {
    return randomUUID();
  }
}
