import { randomUUID } from 'crypto';

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
        type_utilisateur: { select: { nom: true } },
      },
    });
    return user as unknown as UserWithRoleRecord | null;
  }

  async findVehiculeById(id: string): Promise<VehiculeRecord | null> {
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id, deleted_at: null },
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boite_vitesse: true,
        utilisateur: { select: { id: true, nom: true } },
        photo_vehicule: { select: { url: true } },
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
    return this.prisma.marque.create({ data: { id: randomUUID(), nom }, select: { id: true } });
  }

  async findOrCreateModele(marqueId: string, nom: string): Promise<{ id: string }> {
    const existing = await this.prisma.modele.findFirst({ where: { marque_id: marqueId, nom: { equals: nom, mode: 'insensitive' } }, select: { id: true } });
    if (existing) return existing;
    return this.prisma.modele.create({ data: { id: randomUUID(), marque_id: marqueId, nom }, select: { id: true } });
  }

  async findCarburantById(id: string): Promise<{ id: string } | null> {
    return this.prisma.carburant.findUnique({ where: { id }, select: { id: true } });
  }

  async findBoiteVitesseById(id: string): Promise<{ id: string } | null> {
    return this.prisma.boite_vitesse.findUnique({ where: { id }, select: { id: true } });
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
      where: { marque_id: marqueId },
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
    const items = await this.prisma.boite_vitesse.findMany({ 
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
        boite_vitesse: true,
        utilisateur: { select: { id: true, nom: true } },
        photo_vehicule: { select: { url: true } },
      },
    });
    return vehicule as unknown as VehiculeRecord;
  }

  async createPhoto(data: CreateVehiculePhotoInput): Promise<VehiculePhotoRecord> {
    return this.prisma.photo_vehicule.create({
      data: { ...data, id: randomUUID() },
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

    const where: Prisma.vehiculeWhereInput = {
      statut: 'PUBLIE',
      deleted_at: null,
      ...(marqueId && { marque_id_equals: { marque_id: marqueId } }), // This depends on how Prisma maps it, but typically:
      ...(marqueId && { marque_id: marqueId }),
      ...(modeleId && { modele_id: modeleId }),
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
          boite_vitesse: true,
          utilisateur: { select: { id: true, nom: true } },
          photo_vehicule: { select: { url: true } },
        },
      }),
    ]);

    return { total, items: items as unknown as VehiculeRecord[] };
  }

  async findByProprietaireId(proprietaireId: string): Promise<VehiculeRecord[]> {
    const vehicules = await this.prisma.vehicule.findMany({
      where: { proprietaire_id: proprietaireId, deleted_at: null },
      include: {
        marque: true,
        modele: true,
        carburant: true,
        boite_vitesse: true,
        utilisateur: { select: { id: true, nom: true } },
        photo_vehicule: { select: { url: true } },
      },
      orderBy: { created_at: 'desc' },
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
        boite_vitesse: true,
        utilisateur: { select: { id: true, nom: true } },
        photo_vehicule: { select: { url: true } },
      },
    });
    return vehicule as unknown as VehiculeRecord;
  }

  async deleteVehicule(id: string): Promise<{ id: string }> {
    return this.prisma.vehicule.update({
      where: { id },
      data: { deleted_at: new Date() },
      select: { id: true },
    });
  }

  async existsFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null> {
    return this.prisma.vehicule_favori.findUnique({
      where: { utilisateur_id_vehicule_id: { utilisateur_id: utilisateurId, vehicule_id: vehiculeId } },
      select: { id: true },
    });
  }

  async createFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string }> {
    return this.prisma.vehicule_favori.create({
      data: { id: randomUUID(), utilisateur_id: utilisateurId, vehicule_id: vehiculeId },
      select: { id: true },
    });
  }

  async deleteFavori(utilisateurId: string, vehiculeId: string): Promise<{ count: number }> {
    return this.prisma.vehicule_favori.deleteMany({
      where: { utilisateur_id: utilisateurId, vehicule_id: vehiculeId },
    });
  }

  async findFavorisByUtilisateur(utilisateurId: string): Promise<VehiculeFavoriRecord[]> {
    const favoris = await this.prisma.vehicule_favori.findMany({
      where: { utilisateur_id: utilisateurId },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            carburant: true,
            boite_vitesse: true,
            utilisateur: { select: { id: true, nom: true } },
            photo_vehicule: { select: { url: true } },
          },
        },
      },
    });
    return favoris as unknown as VehiculeFavoriRecord[];
  }

  async isFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null> {
    return this.prisma.vehicule_favori.findUnique({
      where: { utilisateur_id_vehicule_id: { utilisateur_id: utilisateurId, vehicule_id: vehiculeId } },
      select: { id: true },
    });
  }

  async countFavoris(vehiculeId: string): Promise<number> {
    return this.prisma.vehicule_favori.count({ where: { vehicule_id: vehiculeId } });
  }

  async updateVehiculePhotos(vehiculeId: string, photosUrls: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.photo_vehicule.deleteMany({ where: { vehicule_id: vehiculeId } }),
      this.prisma.photo_vehicule.createMany({
        data: photosUrls.map((url) => ({
          id: randomUUID(),
          vehicule_id: vehiculeId,
          url,
        })),
      }),
    ]);
  }
}
