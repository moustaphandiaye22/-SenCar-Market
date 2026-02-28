import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  CreateVehiculeInput,
  CreateVehiculePhotoInput,
  UpdateVehiculeInput,
  UserWithRoleRecord,
  VehiculeFavoriRecord,
  VehiculePhotoRecord,
  VehiculeRecord,
} from './vehicule.models';
import { VehiculeRepositoryPort } from './vehicule.repository.port';

@Injectable()
export class VehiculeRepository implements VehiculeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserWithRoleRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { typeUtilisateur: true },
    });
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

  findMarqueById(id: string): Promise<{ id: string } | null> {
    return this.prisma.marque.findUnique({ where: { id }, select: { id: true } });
  }

  findModeleById(id: string): Promise<{ id: string } | null> {
    return this.prisma.modele.findUnique({ where: { id }, select: { id: true } });
  }

  findCarburantById(id: string): Promise<{ id: string } | null> {
    return this.prisma.carburant.findUnique({ where: { id }, select: { id: true } });
  }

  findBoiteVitesseById(id: string): Promise<{ id: string } | null> {
    return this.prisma.boiteVitesse.findUnique({ where: { id }, select: { id: true } });
  }

  createVehicule(data: CreateVehiculeInput): Promise<VehiculeRecord> {
    return this.prisma.vehicule.create({
      data,
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: true,
        photos: true,
      },
    }) as Promise<VehiculeRecord>;
  }

  createPhoto(data: CreateVehiculePhotoInput): Promise<VehiculePhotoRecord> {
    return this.prisma.photoVehicule.create({ data });
  }

  async findPublishedPaged(params: {
    skip: number;
    take: number;
    orderBy: Record<string, 'asc' | 'desc'>;
    marqueId?: string;
    modeleId?: string;
  }): Promise<{ total: number; items: VehiculeRecord[] }> {
    const where = {
      statut: 'PUBLIE',
      ...(params.marqueId ? { marqueId: params.marqueId } : {}),
      ...(params.modeleId ? { modeleId: params.modeleId } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.vehicule.count({ where }),
      this.prisma.vehicule.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ estBoost: 'desc' }, params.orderBy],
        include: {
          marque: true,
          modele: true,
          carburant: true,
          boiteVitesse: true,
          proprietaire: true,
          photos: true,
        },
      }),
    ]);

    return { total, items };
  }

  findByProprietaireId(proprietaireId: string): Promise<VehiculeRecord[]> {
    return this.prisma.vehicule.findMany({
      where: { proprietaireId },
      orderBy: { createdAt: 'desc' },
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

  updateVehicule(id: string, data: UpdateVehiculeInput): Promise<VehiculeRecord> {
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

  deleteVehicule(id: string): Promise<{ id: string }> {
    return this.prisma.vehicule.delete({ where: { id }, select: { id: true } });
  }

  existsFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null> {
    return this.prisma.vehiculeFavori.findUnique({
      where: {
        utilisateurId_vehiculeId: {
          utilisateurId,
          vehiculeId,
        },
      },
      select: { id: true },
    });
  }

  createFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string }> {
    return this.prisma.vehiculeFavori.create({
      data: {
        id: randomUUID(),
        utilisateur: { connect: { id: utilisateurId } },
        vehicule: { connect: { id: vehiculeId } },
      },
      select: { id: true },
    });
  }

  deleteFavori(utilisateurId: string, vehiculeId: string): Promise<{ count: number }> {
    return this.prisma.vehiculeFavori.deleteMany({
      where: { utilisateurId, vehiculeId },
    });
  }

  findFavorisByUtilisateur(utilisateurId: string): Promise<VehiculeFavoriRecord[]> {
    return this.prisma.vehiculeFavori.findMany({
      where: { utilisateurId },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            carburant: true,
            boiteVitesse: true,
            proprietaire: true,
            photos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  isFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null> {
    return this.prisma.vehiculeFavori.findUnique({
      where: {
        utilisateurId_vehiculeId: {
          utilisateurId,
          vehiculeId,
        },
      },
      select: { id: true },
    });
  }

  countFavoris(vehiculeId: string): Promise<number> {
    return this.prisma.vehiculeFavori.count({ where: { vehiculeId } });
  }
}
