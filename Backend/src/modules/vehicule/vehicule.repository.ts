import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import {
  VehiculeRecord,
  CreateVehiculeInput,
  CreateVehiculePhotoInput,
  UpdateVehiculeInput,
  VehiculeFavoriRecord,
  VehiculePhotoRecord,
  UserWithRoleRecord,
} from './vehicule.models';
import { VehiculeRepositoryPort } from './vehicule.repository.port';

@Injectable()
export class VehiculeRepository implements VehiculeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserWithRoleRecord | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        typeUtilisateur: { select: { nom: true } },
      },
    });
    return user as unknown as UserWithRoleRecord | null;
  }

  async findVehiculeById(id: string): Promise<VehiculeRecord | null> {
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id, deletedAt: null },
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: { select: { id: true, nom: true } },
        photos: { select: { url: true } },
      },
    });
    return vehicule as unknown as VehiculeRecord | null;
  }

  async findMarqueById(id: string): Promise<{ id: string } | null> {
    return this.prisma.marque.findUnique({ where: { id }, select: { id: true } });
  }

  async findModeleById(id: string): Promise<{ id: string } | null> {
    return this.prisma.modele.findUnique({ where: { id }, select: { id: true } });
  }

  async findOrCreateMarque(nom: string): Promise<{ id: string }> {
    const existing = await this.prisma.marque.findFirst({ where: { nom: { equals: nom, mode: 'insensitive' } }, select: { id: true } });
    if (existing) return existing;
    return this.prisma.marque.create({ data: { nom }, select: { id: true } });
  }

  async findOrCreateModele(marqueId: string, nom: string): Promise<{ id: string }> {
    const existing = await this.prisma.modele.findFirst({ where: { marqueId, nom: { equals: nom, mode: 'insensitive' } }, select: { id: true } });
    if (existing) return existing;
    return this.prisma.modele.create({ data: { marqueId, nom }, select: { id: true } });
  }

  async findCarburantById(id: string): Promise<{ id: string } | null> {
    return this.prisma.carburant.findUnique({ where: { id }, select: { id: true } });
  }

  async findBoiteVitesseById(id: string): Promise<{ id: string } | null> {
    return this.prisma.boiteVitesse.findUnique({ where: { id }, select: { id: true } });
  }

  async findAllMarques(): Promise<{ id: string; nom: string }[]> {
    const items = await this.prisma.marque.findMany({ 
      select: { id: true, nom: true }, 
      orderBy: { nom: 'asc' } 
    });
    return items.map(i => ({ id: i.id, nom: i.nom ?? '' }));
  }

  async findModelesByMarque(marqueId: string): Promise<{ id: string; nom: string }[]> {
    const items = await this.prisma.modele.findMany({
      where: { marqueId },
      select: { id: true, nom: true },
      orderBy: { nom: 'asc' },
    });
    return items.map(i => ({ id: i.id, nom: i.nom ?? '' }));
  }

  async findAllCarburants(): Promise<{ id: string; nom: string }[]> {
    const items = await this.prisma.carburant.findMany({ 
      select: { id: true, nom: true }, 
      orderBy: { nom: 'asc' } 
    });
    return items.map(i => ({ id: i.id, nom: i.nom ?? '' }));
  }

  async findAllBoiteVitesses(): Promise<{ id: string; nom: string }[]> {
    const items = await this.prisma.boiteVitesse.findMany({ 
      select: { id: true, nom: true }, 
      orderBy: { nom: 'asc' } 
    });
    return items.map(i => ({ id: i.id, nom: i.nom ?? '' }));
  }

  async createVehicule(data: CreateVehiculeInput): Promise<VehiculeRecord> {
    const vehicule = await this.prisma.vehicule.create({
      data,
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: { select: { id: true, nom: true } },
        photos: { select: { url: true } },
      },
    });
    return vehicule as unknown as VehiculeRecord;
  }

  async createPhoto(data: CreateVehiculePhotoInput): Promise<VehiculePhotoRecord> {
    return this.prisma.photoVehicule.create({
      data,
      select: { url: true },
    }) as unknown as VehiculePhotoRecord;
  }

  async findPublishedPaged(params: {
    skip: number;
    take: number;
    orderBy: Record<string, 'asc' | 'desc'>;
    marqueId?: string;
    modeleId?: string;
    q?: string;
  }): Promise<{ total: number; items: VehiculeRecord[] }> {
    const { skip, take, orderBy, marqueId, modeleId, q } = params;

    const where: Prisma.VehiculeWhereInput = {
      statut: 'PUBLIE',
      deletedAt: null,
      ...(marqueId && { marqueId }),
      ...(modeleId && { modeleId }),
      ...(q && {
        OR: [
          { marque: { nom: { contains: q, mode: 'insensitive' } } },
          { modele: { nom: { contains: q, mode: 'insensitive' } } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.vehicule.count({ where }),
      this.prisma.vehicule.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          marque: true,
          modele: true,
          carburant: true,
          boiteVitesse: true,
          proprietaire: { select: { id: true, nom: true } },
          photos: { select: { url: true } },
        },
      }),
    ]);

    return { total, items: items as unknown as VehiculeRecord[] };
  }

  async findByProprietaireId(proprietaireId: string): Promise<VehiculeRecord[]> {
    const vehicules = await this.prisma.vehicule.findMany({
      where: { proprietaireId, deletedAt: null },
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: { select: { id: true, nom: true } },
        photos: { select: { url: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return vehicules as unknown as VehiculeRecord[];
  }

  async updateVehicule(id: string, data: UpdateVehiculeInput): Promise<VehiculeRecord> {
    const vehicule = await this.prisma.vehicule.update({
      where: { id },
      data,
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boiteVitesse: true,
        proprietaire: { select: { id: true, nom: true } },
        photos: { select: { url: true } },
      },
    });
    return vehicule as unknown as VehiculeRecord;
  }

  async deleteVehicule(id: string): Promise<{ id: string }> {
    return this.prisma.vehicule.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async existsFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null> {
    return this.prisma.vehiculeFavori.findUnique({
      where: { utilisateurId_vehiculeId: { utilisateurId, vehiculeId } },
      select: { id: true },
    });
  }

  async createFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string }> {
    return this.prisma.vehiculeFavori.create({
      data: { utilisateurId, vehiculeId },
      select: { id: true },
    });
  }

  async deleteFavori(utilisateurId: string, vehiculeId: string): Promise<{ count: number }> {
    return this.prisma.vehiculeFavori.deleteMany({
      where: { utilisateurId, vehiculeId },
    });
  }

  async findFavorisByUtilisateur(utilisateurId: string): Promise<VehiculeFavoriRecord[]> {
    const favoris = await this.prisma.vehiculeFavori.findMany({
      where: { utilisateurId },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            carburant: true,
            boiteVitesse: true,
            proprietaire: { select: { id: true, nom: true } },
            photos: { select: { url: true } },
          },
        },
      },
    });
    return favoris as unknown as VehiculeFavoriRecord[];
  }

  async isFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null> {
    return this.prisma.vehiculeFavori.findUnique({
      where: { utilisateurId_vehiculeId: { utilisateurId, vehiculeId } },
      select: { id: true },
    });
  }

  async countFavoris(vehiculeId: string): Promise<number> {
    return this.prisma.vehiculeFavori.count({ where: { vehiculeId } });
  }

  async updateVehiculePhotos(vehiculeId: string, photosUrls: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.photoVehicule.deleteMany({ where: { vehiculeId } }),
      this.prisma.photoVehicule.createMany({
        data: photosUrls.map((url) => ({
          vehiculeId,
          url,
        })),
      }),
    ]);
  }
}
