import { randomUUID } from "crypto";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

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
} from "./location.models";
import {
  LocationRepositoryPort,
  PaiementRecord,
} from "./location.repository.port";

@Injectable()
export class LocationRepository implements LocationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findPaiementById(id: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findUnique({
      where: { id },
    }) as Promise<PaiementRecord | null>;
  }

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { type_utilisateur: true },
    }) as Promise<UserRecord | null>;
  }

  findVehiculeById(id: string): Promise<VehiculeRecord | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        marque: true,
        modele: true,
        photo_vehicule: true,
        carburant: true,
        boite_vitesse: true,
      },
    }) as Promise<VehiculeRecord | null>;
  }

  createAnnonce(data: CreateAnnonceInput): Promise<AnnonceRecord> {
    return this.prisma.annonce_location.create({
      data,
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            photo_vehicule: true,
            carburant: true,
            boite_vitesse: true,
          },
        },
        utilisateur: { include: { type_utilisateur: true } },
      },
    }) as Promise<AnnonceRecord>;
  }

  findAnnonceById(id: string): Promise<AnnonceRecord | null> {
    return this.prisma.annonce_location.findUnique({
      where: { id },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            photo_vehicule: true,
            carburant: true,
            boite_vitesse: true,
          },
        },
        utilisateur: { include: { type_utilisateur: true } },
      },
    }) as Promise<AnnonceRecord | null>;
  }

  findAnnoncesAll(): Promise<AnnonceRecord[]> {
    return this.prisma.annonce_location.findMany({
      orderBy: { created_at: "desc" },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            photo_vehicule: true,
            carburant: true,
            boite_vitesse: true,
          },
        },
        utilisateur: { include: { type_utilisateur: true } },
      },
    }) as Promise<AnnonceRecord[]>;
  }

  async findAnnoncesAllPaginated(page: number, size: number): Promise<{ items: AnnonceRecord[]; total: number }> {
    const include = {
      vehicule: {
        include: {
          marque: true,
          modele: true,
          photo_vehicule: true,
          carburant: true,
          boite_vitesse: true,
        },
      },
      utilisateur: { include: { type_utilisateur: true } },
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.annonce_location.findMany({
        skip: page * size,
        take: size,
        orderBy: { created_at: "desc" },
        include,
      }),
      this.prisma.annonce_location.count(),
    ]);
    return { items: items as AnnonceRecord[], total };
  }

  findAnnoncesByProprietaireId(
    proprietaireId: string,
  ): Promise<AnnonceRecord[]> {
    return this.prisma.annonce_location.findMany({
      where: { proprietaire_id: proprietaireId },
      orderBy: { created_at: "desc" },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            photo_vehicule: true,
            carburant: true,
            boite_vitesse: true,
          },
        },
        utilisateur: { include: { type_utilisateur: true } },
      },
    }) as Promise<AnnonceRecord[]>;
  }

  updateAnnonce(id: string, data: UpdateAnnonceInput): Promise<AnnonceRecord> {
    return this.prisma.annonce_location.update({
      where: { id },
      data,
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            photo_vehicule: true,
            carburant: true,
            boite_vitesse: true,
          },
        },
        utilisateur: { include: { type_utilisateur: true } },
      },
    }) as Promise<AnnonceRecord>;
  }

  deleteAnnonce(id: string): Promise<AnnonceRecord> {
    return this.prisma.annonce_location.delete({
      where: { id },
      include: {
        vehicule: {
          include: {
            marque: true,
            modele: true,
            photo_vehicule: true,
            carburant: true,
            boite_vitesse: true,
          },
        },
        utilisateur: { include: { type_utilisateur: true } },
      },
    }) as Promise<AnnonceRecord>;
  }

  createReservation(data: CreateReservationInput): Promise<ReservationRecord> {
    return this.prisma.reservation_location.create({
      data,
      include: {
        utilisateur: { include: { type_utilisateur: true } },
        annonce_location: {
          include: {
            utilisateur: { include: { type_utilisateur: true } },
            vehicule: {
              include: {
                marque: true,
                modele: true,
                photo_vehicule: true,
                carburant: true,
                boite_vitesse: true,
              },
            },
          },
        },
      },
    }) as Promise<ReservationRecord>;
  }

  findReservationById(id: string): Promise<ReservationRecord | null> {
    return this.prisma.reservation_location.findUnique({
      where: { id },
      include: {
        utilisateur: { include: { type_utilisateur: true } },
        annonce_location: {
          include: {
            utilisateur: { include: { type_utilisateur: true } },
            vehicule: {
              include: {
                marque: true,
                modele: true,
                photo_vehicule: true,
                carburant: true,
                boite_vitesse: true,
              },
            },
          },
        },
      },
    }) as Promise<ReservationRecord | null>;
  }

  findReservationsByAnnonceLocationId(
    annonceLocationId: string,
  ): Promise<ReservationRecord[]> {
    return this.prisma.reservation_location.findMany({
      where: { annonce_location_id: annonceLocationId },
      include: {
        utilisateur: { include: { type_utilisateur: true } },
        annonce_location: {
          include: {
            utilisateur: { include: { type_utilisateur: true } },
            vehicule: {
              include: {
                marque: true,
                modele: true,
                photo_vehicule: true,
                carburant: true,
                boite_vitesse: true,
              },
            },
          },
        },
      },
      orderBy: { date_creation: "desc" },
    }) as Promise<ReservationRecord[]>;
  }

  findReservationsByLocataireId(
    locataireId: string,
  ): Promise<ReservationRecord[]> {
    return this.prisma.reservation_location.findMany({
      where: { locataire_id: locataireId },
      include: {
        utilisateur: { include: { type_utilisateur: true } },
        annonce_location: {
          include: {
            utilisateur: { include: { type_utilisateur: true } },
            vehicule: {
              include: {
                marque: true,
                modele: true,
                photo_vehicule: true,
                carburant: true,
                boite_vitesse: true,
              },
            },
          },
        },
      },
      orderBy: { date_creation: "desc" },
    }) as Promise<ReservationRecord[]>;
  }

  updateReservation(
    id: string,
    data: UpdateReservationInput,
  ): Promise<ReservationRecord> {
    return this.prisma.reservation_location.update({
      where: { id },
      data,
      include: {
        utilisateur: { include: { type_utilisateur: true } },
        annonce_location: {
          include: {
            utilisateur: { include: { type_utilisateur: true } },
            vehicule: {
              include: {
                marque: true,
                modele: true,
                photo_vehicule: true,
                carburant: true,
                boite_vitesse: true,
              },
            },
          },
        },
      },
    }) as Promise<ReservationRecord>;
  }

  createDisponibilite(
    data: CreateDisponibiliteInput,
  ): Promise<DisponibiliteRecord> {
    return this.prisma.disponibilite_location.create({
      data,
    }) as Promise<DisponibiliteRecord>;
  }

  findDisponibilitesByAnnonceId(
    annonceLocationId: string,
  ): Promise<DisponibiliteRecord[]> {
    return this.prisma.disponibilite_location.findMany({
      where: { annonce_location_id: annonceLocationId },
      orderBy: { date: "asc" },
    }) as Promise<DisponibiliteRecord[]>;
  }

  deleteDisponibilitesByAnnonceId(
    annonceLocationId: string,
  ): Promise<{ count: number }> {
    return this.prisma.disponibilite_location.deleteMany({
      where: { annonce_location_id: annonceLocationId },
    });
  }

  createHistorique(data: CreateHistoriqueInput): Promise<HistoriqueRecord> {
    return this.prisma.historique_statut_reservation.create({
      data,
    }) as Promise<HistoriqueRecord>;
  }

  findHistoriqueByReservationId(
    reservationId: string,
  ): Promise<HistoriqueRecord[]> {
    return this.prisma.historique_statut_reservation.findMany({
      where: { reservation_id: reservationId },
      orderBy: { created_at: "desc" },
    }) as Promise<HistoriqueRecord[]>;
  }

  newId(): string {
    return randomUUID();
  }
}
