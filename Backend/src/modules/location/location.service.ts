import { createHash } from "crypto";

import { Inject, Injectable, Logger } from "@nestjs/common";

import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { DomainException } from "../../common/exceptions/domain.exception";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { AnnonceLocationResponseDto } from "./dto/annonce-location-response.dto";
import { CancelReservationRequestDto } from "./dto/cancel-reservation-request.dto";
import { CreateAnnonceLocationRequestDto } from "./dto/create-annonce-location-request.dto";
import { CreateReservationRequestDto } from "./dto/create-reservation-request.dto";
import { DisponibiliteLocationResponseDto } from "./dto/disponibilite-location-response.dto";
import { DisponibiliteRequestDto } from "./dto/disponibilite-request.dto";
import { HistoriqueStatutResponseDto } from "./dto/historique-statut-response.dto";
import { ReservationLocationResponseDto } from "./dto/reservation-location-response.dto";
import { UpdateAnnonceLocationRequestDto } from "./dto/update-annonce-location-request.dto";
import {
  AnnonceRecord,
  CreateReservationInput,
  ReservationRecord,
  UserRecord,
  toHistoriqueDto,
} from "./location.models";
import {
  LOCATION_REPOSITORY_PORT,
  LocationRepositoryPort,
} from "./location.repository.port";
import { LocationAccessPolicy } from "./services/location-access.policy";
import { LocationMapper } from "./services/location.mapper";
import { LocationInputValidator } from "./validation/location-input.validator";

const RESERVATION_ACTIVE_STATUSES = ["EN_ATTENTE", "CONFIRME"];

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @Inject(LOCATION_REPOSITORY_PORT)
    private readonly repository: LocationRepositoryPort,
    private readonly inputValidator: LocationInputValidator,
    private readonly accessPolicy: LocationAccessPolicy,
    private readonly mapper: LocationMapper,
  ) {}

  async createAnnonceLocation(
    request: CreateAnnonceLocationRequestDto,
    user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    this.accessPolicy.assertCanCreateAnnonce(currentUser.type_utilisateur?.nom);

    const vehicule = await this.repository.findVehiculeById(request.vehiculeId);
    if (!vehicule) {
      throw new DomainException(
        "Véhicule non trouvé",
        404,
        "VEHICULE_NOT_FOUND",
      );
    }

    const annonce = await this.repository.createAnnonce({
      id: this.repository.newId(),
      vehicule: { connect: { id: request.vehiculeId } },
      utilisateur: { connect: { id: currentUser.id } },
      tarif_journalier: request.tarifJournalier,
      description: request.description,
      conditions: request.conditions,
      caution: request.caution,
      kilometrage_inclus: request.kilometrageInclus,
      tarif_km_supplementaire: request.tarifKmSupplementaire,
      statut: "ACTIF",
      actif: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.mapper.toAnnonceResponse(annonce);
  }

  async updateAnnonceLocation(
    id: string,
    request: UpdateAnnonceLocationRequestDto,
    user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(id);
    this.accessPolicy.assertAnnonceOwnerOrAdmin(
      annonce,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const updated = await this.repository.updateAnnonce(id, {
      ...(request.tarifJournalier !== undefined
        ? { tarif_journalier: request.tarifJournalier }
        : {}),
      ...(request.description !== undefined
        ? { description: request.description }
        : {}),
      ...(request.conditions !== undefined
        ? { conditions: request.conditions }
        : {}),
      ...(request.caution !== undefined ? { caution: request.caution } : {}),
      ...(request.kilometrageInclus !== undefined
        ? { kilometrage_inclus: request.kilometrageInclus }
        : {}),
      ...(request.tarifKmSupplementaire !== undefined
        ? { tarif_km_supplementaire: request.tarifKmSupplementaire }
        : {}),
      updated_at: new Date(),
    });

    return this.mapper.toAnnonceResponse(updated);
  }

  async deleteAnnonceLocation(
    id: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(id);
    this.accessPolicy.assertAnnonceOwnerOrAdmin(
      annonce,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    await this.repository.deleteAnnonce(id);
  }

  async getAnnonceLocationById(
    id: string,
  ): Promise<AnnonceLocationResponseDto> {
    const annonce = await this.mustFindAnnonce(id);
    return this.mapper.toAnnonceResponse(annonce);
  }

  async getAllAnnoncesLocation(): Promise<AnnonceLocationResponseDto[]> {
    const annonces = await this.repository.findAnnoncesAll();
    return annonces.map((annonce) => this.mapper.toAnnonceResponse(annonce));
  }

  async getAllAnnoncesLocationPaginated(
    page: number,
    size: number,
  ): Promise<PaginatedResponseDto<AnnonceLocationResponseDto>> {
    const { items, total } = await this.repository.findAnnoncesAllPaginated(page, size);
    const totalPages = Math.ceil(total / size);
    return {
      content: items.map((a) => this.mapper.toAnnonceResponse(a)),
      page,
      size,
      totalElements: total,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
    };
  }

  async getMesAnnoncesLocation(
    user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const annonces = await this.repository.findAnnoncesByProprietaireId(
      currentUser.id,
    );
    return annonces.map((annonce) => this.mapper.toAnnonceResponse(annonce));
  }

  async activerDesactiverAnnonce(
    id: string,
    actif: boolean,
    user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(id);
    this.accessPolicy.assertAnnonceOwnerOrAdmin(
      annonce,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const updated = await this.repository.updateAnnonce(id, {
      actif,
      updated_at: new Date(),
    });

    return this.mapper.toAnnonceResponse(updated);
  }

  async createReservation(
    request: CreateReservationRequestDto,
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    this.logger.log(
      `Tentative de réservation pour l'annonce ${request.annonceLocationId} par ${user.email}`,
    );
    const locataire = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(request.annonceLocationId);

    if (locataire.id === annonce.proprietaire_id) {
      throw new DomainException(
        "Vous ne pouvez pas louer votre propre véhicule",
        400,
        "ANNONCE_OWNER_CANNOT_RENT",
      );
    }

    if (!annonce.actif) {
      throw new DomainException(
        "Annonce de location inactive",
        400,
        "ANNONCE_LOCATION_INACTIVE",
      );
    }

    const { dateDebut, dateFin } = this.inputValidator.parseReservationDates(
      request.dateDebut,
      request.dateFin,
    );

    const reservations =
      await this.repository.findReservationsByAnnonceLocationId(annonce.id);
    const overlap = reservations.some((reservation) => {
      if (!reservation.date_debut || !reservation.date_fin) {
        return false;
      }
      if (
        !reservation.statut ||
        !RESERVATION_ACTIVE_STATUSES.includes(reservation.statut)
      ) {
        return false;
      }
      return !(
        dateFin < reservation.date_debut || dateDebut > reservation.date_fin
      );
    });

    if (overlap) {
      throw new DomainException(
        "Le véhicule n'est pas disponible sur cette période",
        400,
        "RESERVATION_NOT_AVAILABLE",
      );
    }

    const coutTotal = this.calculateCoutTotal(
      annonce.tarif_journalier,
      dateDebut,
      dateFin,
    );

    // If paiementId is provided, verify the payment exists
    if (request.paiementId) {
      const payment = await this.repository.findPaiementById(
        request.paiementId,
      );
      if (!payment) {
        throw new DomainException(
          "Paiement non trouvé",
          404,
          "PAIEMENT_NOT_FOUND",
        );
      }
    }

    const reservationData: CreateReservationInput & { paiement_id?: string } = {
      id: this.repository.newId(),
      annonce_location: { connect: { id: annonce.id } },
      utilisateur: { connect: { id: locataire.id } },
      statut: "EN_ATTENTE" as const,
      cout_total: coutTotal,
      date_debut: dateDebut,
      date_fin: dateFin,
      date_creation: new Date(),
      ...(request.paiementId ? { paiement_id: request.paiementId } : {}),
    };

    const reservation = await this.repository.createReservation(
      reservationData as CreateReservationInput,
    );

    return this.mapper.toReservationResponse(reservation);
  }

  async processPayment(
    reservationId: string,
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const reservation = await this.mustFindReservation(reservationId);
    
    this.accessPolicy.assertReservationPartyOrAdmin(
      reservation,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    if (!reservation.paiement_id) {
      throw new DomainException(
        "Cette réservation n'a pas de paiement associé",
        400,
        "NO_PAYMENT",
      );
    }

    const payment = await this.repository.findPaiementById(reservation.paiement_id);
    if (!payment) {
      throw new DomainException(
        "Paiement non trouvé",
        404,
        "PAIEMENT_NOT_FOUND",
      );
    }

    if (payment.statut !== "CONFIRME") {
      throw new DomainException(
        "Le paiement doit être confirmé pour activer la réservation",
        400,
        "PAYMENT_NOT_CONFIRMED",
      );
    }

    // Payment is confirmed, update reservation status to CONFIRME
    const updated = await this.repository.updateReservation(reservationId, {
      statut: "CONFIRME",
    });
    return this.mapper.toReservationResponse(updated);
  }

  async updateStatutReservation(
    id: string,
    statut: string,
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const reservation = await this.mustFindReservation(id);
    this.accessPolicy.assertReservationPartyOrAdmin(
      reservation,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const parsed = this.inputValidator.parseReservationStatus(statut);

    // If trying to confirm reservation, verify payment is confirmed
    if (parsed === "CONFIRME" && reservation.paiement_id) {
      const payment = await this.repository.findPaiementById(
        reservation.paiement_id,
      );
      if (!payment) {
        throw new DomainException(
          "Paiement non trouvé pour cette réservation",
          404,
          "PAIEMENT_NOT_FOUND",
        );
      }
      if (payment.statut !== "CONFIRME") {
        throw new DomainException(
          "Le paiement doit être confirmé pour confirmer la réservation",
          400,
          "PAYMENT_NOT_CONFIRMED",
        );
      }
    }

    const updated = await this.repository.updateReservation(id, {
      statut: parsed,
    });

    return this.mapper.toReservationResponse(updated);
  }

  async cancelReservation(
    id: string,
    body: CancelReservationRequestDto | undefined,
    user: AuthenticatedUser,
  ): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    const reservation = await this.mustFindReservation(id);
    this.accessPolicy.assertReservationPartyOrAdmin(
      reservation,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    await this.repository.updateReservation(id, {
      statut: "ANNULE",
      motif_annulation: body?.motif ?? null,
    });
  }

  async getReservationById(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const reservation = await this.mustFindReservation(id);
    this.accessPolicy.assertReservationPartyOrAdmin(
      reservation,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    return this.mapper.toReservationResponse(reservation);
  }

  async getMesReservations(
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const reservations = await this.repository.findReservationsByLocataireId(
      currentUser.id,
    );
    return reservations.map((reservation) =>
      this.mapper.toReservationResponse(reservation),
    );
  }

  async getReservationsByAnnonce(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(id);
    this.accessPolicy.assertAnnonceOwnerOrAdmin(
      annonce,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const reservations =
      await this.repository.findReservationsByAnnonceLocationId(id);
    return reservations.map((reservation) =>
      this.mapper.toReservationResponse(reservation),
    );
  }

  async ajouterDisponibilites(
    annonceId: string,
    request: DisponibiliteRequestDto[],
    user: AuthenticatedUser,
  ): Promise<DisponibiliteLocationResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(annonceId);
    this.accessPolicy.assertAnnonceOwnerOrAdmin(
      annonce,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const created = await Promise.all(
      request.flatMap((item) =>
        item.dates.map((date) => {
          const parsedDate = this.inputValidator.parseDisponibiliteDate(date);
          return this.repository.createDisponibilite({
            id: this.repository.newId(),
            annonce_location: { connect: { id: annonceId } },
            date: parsedDate,
            est_disponible: item.estDisponible ?? true,
          });
        }),
      ),
    );

    return created.map((row) => this.mapper.toDisponibiliteResponse(row));
  }

  async getDisponibilites(
    annonceId: string,
  ): Promise<DisponibiliteLocationResponseDto[]> {
    const disponibilites =
      await this.repository.findDisponibilitesByAnnonceId(annonceId);
    return disponibilites.map((row) =>
      this.mapper.toDisponibiliteResponse(row),
    );
  }

  async supprimerDisponibilites(
    annonceId: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    const annonce = await this.mustFindAnnonce(annonceId);
    this.accessPolicy.assertAnnonceOwnerOrAdmin(
      annonce,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    await this.repository.deleteDisponibilitesByAnnonceId(annonceId);
  }

  async getHistoriqueStatuts(
    id: string,
    user: AuthenticatedUser,
  ): Promise<HistoriqueStatutResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const reservation = await this.mustFindReservation(id);
    this.accessPolicy.assertReservationPartyOrAdmin(
      reservation,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const historique = await this.repository.findHistoriqueByReservationId(id);
    return historique.map((item) => toHistoriqueDto(item));
  }

  async updateStatutReservationAvecHistorique(
    id: string,
    statut: string,
    user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const reservation = await this.mustFindReservation(id);
    this.accessPolicy.assertReservationPartyOrAdmin(
      reservation,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const parsed = this.inputValidator.parseReservationStatus(statut);

    // If trying to confirm reservation, verify payment is confirmed
    if (parsed === "CONFIRME" && reservation.paiement_id) {
      const payment = await this.repository.findPaiementById(
        reservation.paiement_id,
      );
      if (!payment) {
        throw new DomainException(
          "Paiement non trouvé pour cette réservation",
          404,
          "PAIEMENT_NOT_FOUND",
        );
      }
      if (payment.statut !== "CONFIRME") {
        throw new DomainException(
          "Le paiement doit être confirmé pour confirmer la réservation",
          400,
          "PAYMENT_NOT_CONFIRMED",
        );
      }
    }

    const updated = await this.repository.updateReservation(id, {
      statut: parsed,
    });

    await this.repository.createHistorique({
      id: this.repository.newId(),
      reservation_location: { connect: { id } },
      ancien_statut_id: reservation.statut
        ? this.uuidFromString(reservation.statut)
        : null,
      nouveau_statut_id: this.uuidFromString(parsed),
      created_at: new Date(),
    });

    return this.mapper.toReservationResponse(updated);
  }

  private async mustFindUser(email: string): Promise<UserRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException(
        "Utilisateur non trouvé",
        404,
        "USER_NOT_FOUND",
      );
    }
    return user;
  }

  private async mustFindAnnonce(id: string): Promise<AnnonceRecord> {
    const annonce = await this.repository.findAnnonceById(id);
    if (!annonce) {
      throw new DomainException(
        "Annonce non trouvée",
        404,
        "ANNONCE_NOT_FOUND",
      );
    }
    return annonce;
  }

  private async mustFindReservation(id: string): Promise<ReservationRecord> {
    const reservation = await this.repository.findReservationById(id);
    if (!reservation) {
      throw new DomainException(
        "Réservation non trouvée",
        404,
        "RESERVATION_NOT_FOUND",
      );
    }
    return reservation;
  }

  private calculateCoutTotal(
    tarifJournalierRaw: unknown,
    debut: Date,
    fin: Date,
  ): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = Math.ceil((fin.getTime() - debut.getTime()) / msPerDay);
    const jours = diff <= 0 ? 1 : diff;

    const tarifJournalier = Number(tarifJournalierRaw ?? 0);
    if (!Number.isFinite(tarifJournalier) || tarifJournalier < 0) {
      throw new DomainException(
        "Tarif journalier invalide",
        400,
        "ANNONCE_TARIF_INVALID",
      );
    }
    return tarifJournalier * jours;
  }

  private uuidFromString(value: string): string {
    // Java UUID.nameUUIDFromBytes compatibility (MD5-based UUID v3).
    const hash = createHash("md5").update(value, "utf8").digest();
    const byte6 = hash[6] ?? 0;
    const byte8 = hash[8] ?? 0;
    hash[6] = (byte6 & 0x0f) | 0x30;
    hash[8] = (byte8 & 0x3f) | 0x80;

    const hex = hash.toString("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
}
