import type {
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

export type PaiementRecord = {
  id: string;
  utilisateur_id: string;
  reservation_id: string | null;
  montant: number | null;
  commission: number | null;
  statut: string | null;
  methode_paiement: string | null;
  date_paiement: Date | null;
  reference_transaction: string | null;
  reference_externe: string | null;
  url_paiement: string | null;
  is_escrow: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export const LOCATION_REPOSITORY_PORT = Symbol("LOCATION_REPOSITORY_PORT");

export interface LocationRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findPaiementById(id: string): Promise<PaiementRecord | null>;
  findVehiculeById(id: string): Promise<VehiculeRecord | null>;

  createAnnonce(data: CreateAnnonceInput): Promise<AnnonceRecord>;
  findAnnonceById(id: string): Promise<AnnonceRecord | null>;
  findAnnoncesAll(): Promise<AnnonceRecord[]>;
  findAnnoncesAllPaginated(page: number, size: number): Promise<{ items: AnnonceRecord[]; total: number }>;
  findAnnoncesByProprietaireId(
    proprietaireId: string,
  ): Promise<AnnonceRecord[]>;
  updateAnnonce(id: string, data: UpdateAnnonceInput): Promise<AnnonceRecord>;
  deleteAnnonce(id: string): Promise<AnnonceRecord>;

  createReservation(data: CreateReservationInput): Promise<ReservationRecord>;
  findReservationById(id: string): Promise<ReservationRecord | null>;
  findReservationsByAnnonceLocationId(
    annonceLocationId: string,
  ): Promise<ReservationRecord[]>;
  findReservationsByLocataireId(
    locataireId: string,
  ): Promise<ReservationRecord[]>;
  updateReservation(
    id: string,
    data: UpdateReservationInput,
  ): Promise<ReservationRecord>;

  createDisponibilite(
    data: CreateDisponibiliteInput,
  ): Promise<DisponibiliteRecord>;
  findDisponibilitesByAnnonceId(
    annonceLocationId: string,
  ): Promise<DisponibiliteRecord[]>;
  deleteDisponibilitesByAnnonceId(
    annonceLocationId: string,
  ): Promise<{ count: number }>;

  createHistorique(data: CreateHistoriqueInput): Promise<HistoriqueRecord>;
  findHistoriqueByReservationId(
    reservationId: string,
  ): Promise<HistoriqueRecord[]>;

  newId(): string;
}
