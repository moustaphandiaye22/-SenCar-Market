import type { StatutReservation } from "@prisma/client";

import type { HistoriqueStatutResponseDto } from "./dto/historique-statut-response.dto";

type ConnectById = { connect: { id: string } };

type UserRole = { nom: string };

export type UserRecord = {
  id: string;
  email: string;
  telephone: string;
  prenom: string | null;
  nom: string | null;
  type_utilisateur: UserRole | null;
};

type NamedRecord = { nom: string | null };
type PhotoRecord = { url: string; est_principale: boolean | null };

export type VehiculeRecord = {
  id: string;
  marque: NamedRecord | null;
  modele: NamedRecord | null;
  photo_vehicule: PhotoRecord[];
  carburant: NamedRecord | null;
  boite_vitesse: NamedRecord | null;
  nombre_places: number | null;
};

export type AnnonceRecord = {
  id: string;
  vehicule_id: string | null;
  proprietaire_id: string;
  tarif_journalier: unknown;
  description: string | null;
  conditions: string | null;
  caution: unknown;
  kilometrage_inclus: number | null;
  tarif_km_supplementaire: unknown;
  statut: string | null;
  actif: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  vehicule: VehiculeRecord | null;
  utilisateur: UserRecord;
};

export type ReservationRecord = {
  id: string;
  annonce_location_id: string;
  locataire_id: string;
  statut: StatutReservation | null;
  cout_total: unknown;
  paiement_id: string | null;
  date_debut: Date | null;
  date_fin: Date | null;
  date_creation: Date | null;
  motif_annulation: string | null;
  annonce_location: AnnonceRecord;
  utilisateur: UserRecord;
};

export type DisponibiliteRecord = {
  id: string;
  annonce_location_id: string;
  date: Date | null;
  est_disponible: boolean | null;
};

export type HistoriqueRecord = {
  id: string;
  reservation_id: string;
  ancien_statut_id: string | null;
  nouveau_statut_id: string | null;
  created_at: Date | null;
};

export type CreateAnnonceInput = {
  id: string;
  vehicule: ConnectById;
  utilisateur: ConnectById;
  tarif_journalier: number;
  description?: string;
  conditions?: string;
  caution?: number;
  kilometrage_inclus?: number;
  tarif_km_supplementaire?: number;
  statut: string;
  actif: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UpdateAnnonceInput = Partial<{
  tarif_journalier: number;
  description: string;
  conditions: string;
  caution: number;
  kilometrage_inclus: number;
  tarif_km_supplementaire: number;
  actif: boolean;
  updated_at: Date;
}>;

export type CreateReservationInput = {
  id: string;
  annonce_location: ConnectById;
  utilisateur: ConnectById;
  statut: StatutReservation;
  cout_total: number;
  date_debut: Date;
  date_fin: Date;
  date_creation: Date;
};

export type UpdateReservationInput = Partial<{
  statut: StatutReservation;
  motif_annulation: string | null;
}>;

export type CreateDisponibiliteInput = {
  id: string;
  annonce_location: ConnectById;
  date: Date;
  est_disponible: boolean;
};

export type CreateHistoriqueInput = {
  id: string;
  reservation_location: ConnectById;
  ancien_statut_id: string | null;
  nouveau_statut_id: string;
  created_at: Date;
};

export function toHistoriqueDto(
  item: HistoriqueRecord,
): HistoriqueStatutResponseDto {
  return {
    id: item.id,
    reservationId: item.reservation_id,
    ancienStatutId: item.ancien_statut_id,
    nouveauStatutId: item.nouveau_statut_id,
    createdAt: item.created_at,
  };
}
