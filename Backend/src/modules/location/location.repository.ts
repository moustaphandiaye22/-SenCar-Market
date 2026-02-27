import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  AnnonceRecord,
  CreateAnnonceInput,
  CreateDisponibiliteInput,
  CreateHistoriqueInput,
  CreateReservationInput,
  DisponibiliteRecord,
  HistoriqueRecord,
  ReservationRecord,
  UpdateAnnonceInput,
  UpdateReservationInput,
  UserRecord,
  VehiculeRecord,
} from './location.models';
import { LocationRepositoryPort } from './location.repository.port';

@Injectable()
export class LocationRepository implements LocationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
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
        photos: true,
      },
    });
  }

  createAnnonce(data: CreateAnnonceInput): Promise<AnnonceRecord> {
    return this.prisma.annonceLocation.create({
      data,
      include: {
        vehicule: { include: { marque: true, modele: true, photos: true } },
        proprietaire: { include: { typeUtilisateur: true } },
      },
    });
  }

  findAnnonceById(id: string): Promise<AnnonceRecord | null> {
    return this.prisma.annonceLocation.findUnique({
      where: { id },
      include: {
        vehicule: { include: { marque: true, modele: true, photos: true } },
        proprietaire: { include: { typeUtilisateur: true } },
      },
    });
  }

  findAnnoncesAll(): Promise<AnnonceRecord[]> {
    return this.prisma.annonceLocation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vehicule: { include: { marque: true, modele: true, photos: true } },
        proprietaire: { include: { typeUtilisateur: true } },
      },
    });
  }

  findAnnoncesByProprietaireId(proprietaireId: string): Promise<AnnonceRecord[]> {
    return this.prisma.annonceLocation.findMany({
      where: { proprietaireId },
      orderBy: { createdAt: 'desc' },
      include: {
        vehicule: { include: { marque: true, modele: true, photos: true } },
        proprietaire: { include: { typeUtilisateur: true } },
      },
    });
  }

  updateAnnonce(id: string, data: UpdateAnnonceInput): Promise<AnnonceRecord> {
    return this.prisma.annonceLocation.update({
      where: { id },
      data,
      include: {
        vehicule: { include: { marque: true, modele: true, photos: true } },
        proprietaire: { include: { typeUtilisateur: true } },
      },
    });
  }

  deleteAnnonce(id: string): Promise<AnnonceRecord> {
    return this.prisma.annonceLocation.delete({ where: { id } });
  }

  createReservation(data: CreateReservationInput): Promise<ReservationRecord> {
    return this.prisma.reservationLocation.create({
      data,
      include: {
        locataire: { include: { typeUtilisateur: true } },
        annonceLocation: {
          include: {
            proprietaire: { include: { typeUtilisateur: true } },
            vehicule: { include: { marque: true, modele: true, photos: true } },
          },
        },
      },
    });
  }

  findReservationById(id: string): Promise<ReservationRecord | null> {
    return this.prisma.reservationLocation.findUnique({
      where: { id },
      include: {
        locataire: { include: { typeUtilisateur: true } },
        annonceLocation: {
          include: {
            proprietaire: { include: { typeUtilisateur: true } },
            vehicule: { include: { marque: true, modele: true, photos: true } },
          },
        },
      },
    });
  }

  findReservationsByAnnonceLocationId(annonceLocationId: string): Promise<ReservationRecord[]> {
    return this.prisma.reservationLocation.findMany({
      where: { annonceLocationId },
      include: {
        locataire: { include: { typeUtilisateur: true } },
        annonceLocation: {
          include: {
            proprietaire: { include: { typeUtilisateur: true } },
            vehicule: { include: { marque: true, modele: true, photos: true } },
          },
        },
      },
      orderBy: { dateCreation: 'desc' },
    });
  }

  findReservationsByLocataireId(locataireId: string): Promise<ReservationRecord[]> {
    return this.prisma.reservationLocation.findMany({
      where: { locataireId },
      include: {
        locataire: { include: { typeUtilisateur: true } },
        annonceLocation: {
          include: {
            proprietaire: { include: { typeUtilisateur: true } },
            vehicule: { include: { marque: true, modele: true, photos: true } },
          },
        },
      },
      orderBy: { dateCreation: 'desc' },
    });
  }

  updateReservation(id: string, data: UpdateReservationInput): Promise<ReservationRecord> {
    return this.prisma.reservationLocation.update({
      where: { id },
      data,
      include: {
        locataire: { include: { typeUtilisateur: true } },
        annonceLocation: {
          include: {
            proprietaire: { include: { typeUtilisateur: true } },
            vehicule: { include: { marque: true, modele: true, photos: true } },
          },
        },
      },
    });
  }

  createDisponibilite(data: CreateDisponibiliteInput): Promise<DisponibiliteRecord> {
    return this.prisma.disponibiliteLocation.create({ data });
  }

  findDisponibilitesByAnnonceId(annonceLocationId: string): Promise<DisponibiliteRecord[]> {
    return this.prisma.disponibiliteLocation.findMany({
      where: { annonceLocationId },
      orderBy: { date: 'asc' },
    });
  }

  deleteDisponibilitesByAnnonceId(annonceLocationId: string): Promise<{ count: number }> {
    return this.prisma.disponibiliteLocation.deleteMany({
      where: { annonceLocationId },
    });
  }

  createHistorique(data: CreateHistoriqueInput): Promise<HistoriqueRecord> {
    return this.prisma.historiqueStatutReservation.create({ data });
  }

  findHistoriqueByReservationId(reservationId: string): Promise<HistoriqueRecord[]> {
    return this.prisma.historiqueStatutReservation.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
