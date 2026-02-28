import type { StatutReservation } from '@prisma/client';

import type { HistoriqueStatutResponseDto } from './dto/historique-statut-response.dto';

type ConnectById = { connect: { id: string } };

type UserRole = { nom: string };

export type UserRecord = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  typeUtilisateur: UserRole | null;
};

type NamedRecord = { nom: string | null };
type PhotoRecord = { url: string };

export type VehiculeRecord = {
  id: string;
  marque: NamedRecord | null;
  modele: NamedRecord | null;
  photos: PhotoRecord[];
};

export type AnnonceRecord = {
  id: string;
  vehiculeId: string | null;
  proprietaireId: string;
  tarifJournalier: unknown;
  description: string | null;
  conditions: string | null;
  caution: unknown;
  kilometrageInclus: number | null;
  tarifKmSupplementaire: unknown;
  statut: string | null;
  actif: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  vehicule: VehiculeRecord | null;
  proprietaire: UserRecord;
};

export type ReservationRecord = {
  id: string;
  annonceLocationId: string;
  locataireId: string;
  statut: StatutReservation | null;
  coutTotal: unknown;
  paiementId: string | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  dateCreation: Date | null;
  motifAnnulation: string | null;
  annonceLocation: AnnonceRecord;
  locataire: UserRecord;
};

export type DisponibiliteRecord = {
  id: string;
  annonceLocationId: string;
  date: Date | null;
  estDisponible: boolean | null;
};

export type HistoriqueRecord = {
  id: string;
  reservationId: string;
  ancienStatutId: string | null;
  nouveauStatutId: string | null;
  createdAt: Date | null;
};

export type CreateAnnonceInput = {
  id: string;
  vehicule: ConnectById;
  proprietaire: ConnectById;
  tarifJournalier: number;
  description?: string;
  conditions?: string;
  caution?: number;
  kilometrageInclus?: number;
  tarifKmSupplementaire?: number;
  statut: string;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateAnnonceInput = Partial<{
  tarifJournalier: number;
  description: string;
  conditions: string;
  caution: number;
  kilometrageInclus: number;
  tarifKmSupplementaire: number;
  actif: boolean;
  updatedAt: Date;
}>;

export type CreateReservationInput = {
  id: string;
  annonceLocation: ConnectById;
  locataire: ConnectById;
  statut: StatutReservation;
  coutTotal: number;
  dateDebut: Date;
  dateFin: Date;
  dateCreation: Date;
};

export type UpdateReservationInput = Partial<{
  statut: StatutReservation;
  motifAnnulation: string | null;
}>;

export type CreateDisponibiliteInput = {
  id: string;
  annonceLocation: ConnectById;
  date: Date;
  estDisponible: boolean;
};

export type CreateHistoriqueInput = {
  id: string;
  reservation: ConnectById;
  ancienStatutId: string | null;
  nouveauStatutId: string;
  createdAt: Date;
};

export function toHistoriqueDto(item: HistoriqueRecord): HistoriqueStatutResponseDto {
  return {
    id: item.id,
    reservationId: item.reservationId,
    ancienStatutId: item.ancienStatutId,
    nouveauStatutId: item.nouveauStatutId,
    createdAt: item.createdAt,
  };
}
