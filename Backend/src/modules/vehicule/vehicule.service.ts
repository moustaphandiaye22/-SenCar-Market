import { randomUUID } from "crypto";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { DomainException } from "../../common/exceptions/domain.exception";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";
import {
  normalizeOptionalField,
  normalizeRequiredField,
} from "../../common/utils/field.util";
import {
  buildPaged,
  parsePaginationParams,
} from "../../common/utils/pagination-helper.util";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

import { CreateVehiculeRequestDto } from "./dto/create-vehicule-request.dto";
import { UpdateVehiculeRequestDto } from "./dto/update-vehicule-request.dto";
import { VehiculeFilterDto } from "./dto/vehicule-filter.dto";
import { VehiculeResponseDto } from "./dto/vehicule-response.dto";
import { VehiculeAccessPolicy } from "./services/vehicule-access.policy";
import { VehiculeMapper } from "./services/vehicule.mapper";
import { VehiculeInputValidator } from "./validation/vehicule-input.validator";
import {
  UpdateVehiculeInput,
  UserWithRoleRecord,
  VehiculeFavoriRecord,
  VehiculeRecord,
} from "./vehicule.models";
import {
  VEHICULE_REPOSITORY_PORT,
  VehiculeRepositoryPort,
} from "./vehicule.repository.port";

type UploadedFileLike = { originalname?: string; buffer: Buffer };

@Injectable()
export class VehiculeService {
  private readonly logger = new Logger(VehiculeService.name);

  constructor(
    @Inject(VEHICULE_REPOSITORY_PORT)
    private readonly repository: VehiculeRepositoryPort,
    private readonly inputValidator: VehiculeInputValidator,
    private readonly accessPolicy: VehiculeAccessPolicy,
    private readonly mapper: VehiculeMapper,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createVehicule(
    request: CreateVehiculeRequestDto,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    this.accessPolicy.assertCanCreate(currentUser.type_utilisateur?.nom);
    const couleur = normalizeRequiredField(
      request.couleur,
      "couleur",
      "VEHICULE_INVALID_FIELD",
    );
    const numeroVin = normalizeRequiredField(
      request.numeroVin,
      "numeroVin",
      "VEHICULE_INVALID_FIELD",
    );
    const description = normalizeOptionalField(request.description);
    const immatriculation = normalizeOptionalField(request.immatriculation);
    const photosUrls = this.inputValidator.normalizePhotosUrls(
      request.photosUrls,
    );

    const marque = await this.repository.findOrCreateMarque(request.marque);
    const modele = await this.repository.findOrCreateModele(
      marque.id,
      request.modele,
    );

    const [carburant, boiteVitesse] = await Promise.all([
      this.repository.findCarburantById(request.carburantId),
      this.repository.findBoiteVitesseById(request.boiteVitesseId),
    ]);

    if (!carburant)
      throw new DomainException(
        "Carburant non trouvé",
        404,
        "CARBURANT_NOT_FOUND",
      );
    if (!boiteVitesse)
      throw new DomainException(
        "Boîte de vitesse non trouvée",
        404,
        "BOITE_VITESSE_NOT_FOUND",
      );

    const statut = request.enregistrerEnBrouillon ? "BROUILLON" : "PUBLIE";

    let vehicule;
    try {
      vehicule = await this.repository.createVehicule({
        id: randomUUID(),
        proprietaire_id: currentUser.id,
        marque_id: marque.id,
        modele_id: modele.id,
        annee_fabrication: request.anneeFabrication,
        kilometrage: request.kilometrage,
        carburant_id: request.carburantId,
        boite_vitesse_id: request.boiteVitesseId,
        couleur,
        prix_vente: request.prixVente,
        ...(description !== undefined ? { description } : {}),
        numero_vin: numeroVin,
        ...(immatriculation !== undefined ? { immatriculation } : {}),
        prix_negociable: request.prixNegociable ?? false,
        certifie: request.certifie ?? false,
        titre: request.titre,
        nombre_portes: request.nombrePortes,
        nombre_places: request.nombrePlaces,
        cylindree: request.cylindree,
        puissance_fiscale: request.puissanceFiscale,
        est_garantie: request.estGarantie ?? false,
        garantie_mois: request.garantieMois,
        statut,
        est_boost: false,
        vues: 0,
        nombre_favoris: 0,
      });
    } catch (error) {
      this.handlePrismaError(error, "createVehicule");
    }

    if (photosUrls.length) {
      await Promise.all(
        photosUrls.map((url, index) =>
          this.repository.createPhoto({
            id: randomUUID(),
            vehicule_id: vehicule!.id,
            url,
            est_principale: index === 0,
            ordre: index,
          }),
        ),
      );
    }

    const fullVehicule = await this.mustFindVehicule(vehicule!.id);
    return this.mapper.toVehiculeResponse(fullVehicule, false);
  }

  async searchVehicules(
    filter: VehiculeFilterDto,
  ): Promise<PaginatedResponseDto<VehiculeResponseDto>> {
    const { page, size } = parsePaginationParams(
      filter.page ?? 0,
      filter.size ?? 20,
      { defaultSize: 20 },
    );

    const sortBy = this.inputValidator.resolveSortBy(
      filter.sortBy ?? "createdAt",
    );
    const sortDir = this.inputValidator.parseSortDir(filter.sortDir ?? "DESC");

    const { items, total } = await this.repository.findPublishedPaged({
      skip: page * size,
      take: size,
      orderBy: { [sortBy]: sortDir },
      marqueId: filter.marqueId,
      modeleId: filter.modeleId,
      q: filter.q,
    });

    return buildPaged(
      items.map((item: VehiculeRecord) =>
        this.mapper.toVehiculeResponse(item, false),
      ),
      page,
      size,
      total,
    );
  }

  async getVehiculeById(
    id: string,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);
    this.accessPolicy.assertCanReadVehicule(
      vehicule,
      currentUser.id,
      currentUser.type_utilisateur?.nom,
    );

    const views = (vehicule.vues ?? 0) + 1;
    await this.repository.updateVehicule(id, { vues: views });

    const isFavori = Boolean(
      await this.repository.isFavori(currentUser.id, id),
    );
    return this.mapper.toVehiculeResponse(
      { ...vehicule, vues: views },
      isFavori,
    );
  }

  async getMesVehicules(
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicules = await this.repository.findByProprietaireId(
      currentUser.id,
    );

    return vehicules.map((v: VehiculeRecord) =>
      this.mapper.toVehiculeResponse(v, false),
    );
  }

  async publishVehicule(
    id: string,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);

    this.accessPolicy.assertAdminOrOwner(
      currentUser.type_utilisateur?.nom,
      currentUser.id,
      vehicule.proprietaire_id,
    );

    await this.repository.updateVehicule(id, { statut: "PUBLIE" });
    const updated = await this.mustFindVehicule(id);

    return this.mapper.toVehiculeResponse(updated, false);
  }

  async updateVehicule(
    id: string,
    request: UpdateVehiculeRequestDto,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);

    this.accessPolicy.assertAdminOrOwner(
      currentUser.type_utilisateur?.nom,
      currentUser.id,
      vehicule.proprietaire_id,
    );

    const updateData: UpdateVehiculeInput = {};
    let resolvedMarqueId = vehicule.marque_id;

    if (request.marque) {
      const marque = await this.repository.findOrCreateMarque(request.marque);
      updateData.marque_id = marque.id;
      resolvedMarqueId = marque.id;
    }

    if (request.modele) {
      if (!resolvedMarqueId) {
        throw new DomainException(
          "Impossible de définir le modèle sans marque",
          400,
          "NO_MARQUE_FOR_MODELE",
        );
      }
      const modele = await this.repository.findOrCreateModele(
        resolvedMarqueId,
        request.modele,
      );
      updateData.modele_id = modele.id;
    }

    if (request.carburantId) {
      const carburant = await this.repository.findCarburantById(
        request.carburantId,
      );
      if (!carburant)
        throw new DomainException(
          "Carburant non trouvé",
          404,
          "CARBURANT_NOT_FOUND",
        );
      updateData.carburant_id = request.carburantId;
    }

    if (request.boiteVitesseId) {
      const boiteVitesse = await this.repository.findBoiteVitesseById(
        request.boiteVitesseId,
      );
      if (!boiteVitesse)
        throw new DomainException(
          "Boîte de vitesse non trouvée",
          404,
          "BOITE_VITESSE_NOT_FOUND",
        );
      updateData.boite_vitesse_id = request.boiteVitesseId;
    }

    if (request.anneeFabrication)
      updateData.annee_fabrication = request.anneeFabrication;
    if (request.kilometrage !== undefined)
      updateData.kilometrage = request.kilometrage;
    if (request.couleur)
      updateData.couleur = normalizeRequiredField(
        request.couleur,
        "couleur",
        "VEHICULE_INVALID_FIELD",
      );
    if (request.prixVente) updateData.prix_vente = request.prixVente;
    if (request.description !== undefined)
      updateData.description = normalizeOptionalField(request.description);
    if (request.numeroVin)
      updateData.numero_vin = normalizeRequiredField(
        request.numeroVin,
        "numeroVin",
        "VEHICULE_INVALID_FIELD",
      );
    if (request.immatriculation !== undefined)
      updateData.immatriculation = normalizeOptionalField(
        request.immatriculation,
      );
    if (request.prixNegociable !== undefined)
      updateData.prix_negociable = request.prixNegociable;
    if (request.certifie !== undefined) updateData.certifie = request.certifie;
    if (request.titre !== undefined) updateData.titre = request.titre;
    if (request.nombrePortes !== undefined)
      updateData.nombre_portes = request.nombrePortes;
    if (request.nombrePlaces !== undefined)
      updateData.nombre_places = request.nombrePlaces;
    if (request.cylindree !== undefined)
      updateData.cylindree = request.cylindree;
    if (request.puissanceFiscale !== undefined)
      updateData.puissance_fiscale = request.puissanceFiscale;
    if (request.estGarantie !== undefined)
      updateData.est_garantie = request.estGarantie;
    if (request.garantieMois !== undefined)
      updateData.garantie_mois = request.garantieMois;

    if (request.enregistrerEnBrouillon !== undefined) {
      updateData.statut = request.enregistrerEnBrouillon
        ? "BROUILLON"
        : "PUBLIE";
    }

    await this.repository.updateVehicule(id, updateData);

    // Gérer les photos si fournies
    if (request.photosUrls !== undefined) {
      const photosUrls = this.inputValidator.normalizePhotosUrls(
        request.photosUrls,
      );
      await this.repository.updateVehiculePhotos(id, photosUrls);
    }

    const updated = await this.mustFindVehicule(id);
    const isFavori = Boolean(
      await this.repository.isFavori(currentUser.id, id),
    );
    return this.mapper.toVehiculeResponse(updated, isFavori);
  }

  async deleteVehicule(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);

    this.accessPolicy.assertAdminOrOwner(
      currentUser.type_utilisateur?.nom,
      currentUser.id,
      vehicule.proprietaire_id,
    );
    await this.repository.deleteVehicule(id);
  }

  async addToFavoris(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    await this.mustFindVehicule(id);

    const existing = await this.repository.existsFavori(currentUser.id, id);
    if (!existing) {
      await this.repository.createFavori(currentUser.id, id);
      await this.refreshNombreFavoris(id);
    }
  }

  async removeFromFavoris(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    await this.repository.deleteFavori(currentUser.id, id);
    await this.refreshNombreFavoris(id);
  }

  async getMesFavoris(user: AuthenticatedUser): Promise<VehiculeResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const favoris = await this.repository.findFavorisByUtilisateur(
      currentUser.id,
    );

    return favoris.map((favori: VehiculeFavoriRecord) =>
      this.mapper.toVehiculeResponse(favori.vehicule, true),
    );
  }

  async getAllMarques(): Promise<{ id: string; nom: string }[]> {
    return this.repository.findAllMarques();
  }

  async getModelesByMarque(
    marqueId: string,
  ): Promise<{ id: string; nom: string }[]> {
    return this.repository.findModelesByMarque(marqueId);
  }

  async getAllCarburants(): Promise<{ id: string; nom: string }[]> {
    return this.repository.findAllCarburants();
  }

  async getAllBoiteVitesses(): Promise<{ id: string; nom: string }[]> {
    return this.repository.findAllBoiteVitesses();
  }

  async boostVehicule(
    id: string,
    debutIso: string,
    finIso: string,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    const { debut, fin } = this.inputValidator.parseBoostDates(
      debutIso,
      finIso,
    );

    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);
    this.accessPolicy.assertAdminOrOwner(
      currentUser.type_utilisateur?.nom,
      currentUser.id,
      vehicule.proprietaire_id,
    );

    await this.repository.updateVehicule(id, {
      est_boost: true,
      boost_debut: debut,
      boost_fin: fin,
    });

    const updated = await this.mustFindVehicule(id);
    return this.mapper.toVehiculeResponse(updated, false);
  }

  async uploadPhotos(files: UploadedFileLike[]): Promise<string[]> {
    if (!files || !files.length) {
      throw new DomainException(
        "Fichiers images requis",
        400,
        "VEHICULE_PHOTOS_REQUIRED",
      );
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!file?.buffer?.length) continue;

      try {
        const result = await this.cloudinaryService.uploadImage(
          file,
          "vehicules",
        );
        urls.push(result.secure_url);
      } catch {
        throw new DomainException(
          "Erreur lors de l'upload de l'image",
          500,
          "VEHICULE_PHOTO_UPLOAD_ERROR",
        );
      }
    }
    return urls;
  }

  private async refreshNombreFavoris(vehiculeId: string): Promise<void> {
    const vehicule = await this.repository.findVehiculeById(vehiculeId);
    if (!vehicule) {
      return;
    }

    const count = await this.repository.countFavoris(vehiculeId);
    await this.repository.updateVehicule(vehiculeId, {
      nombre_favoris: count,
    });
  }

  private async mustFindUser(email: string): Promise<UserWithRoleRecord> {
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

  private async mustFindVehicule(id: string): Promise<VehiculeRecord> {
    const vehicule = await this.repository.findVehiculeById(id);
    if (!vehicule) {
      throw new DomainException(
        "Véhicule non trouvé",
        404,
        "VEHICULE_NOT_FOUND",
      );
    }

    return vehicule;
  }

  private handlePrismaError(error: unknown, context: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(`[${context}] Prisma known error: ${error.code} - ${error.message}`, error.meta);
      switch (error.code) {
        case "P2002":
          throw new DomainException(
            "Un véhicule avec ces informations existe déjà",
            409,
            "VEHICULE_DUPLICATE",
          );
        case "P2003":
          throw new DomainException(
            "Référence invalide: une des entités liées n'existe pas",
            400,
            "VEHICULE_INVALID_REFERENCE",
          );
        case "P2025":
          throw new DomainException(
            "Une des entités liées est introuvable",
            404,
            "VEHICULE_RELATED_NOT_FOUND",
          );
        default:
          throw new DomainException(
            `Erreur base de données: ${error.message}`,
            500,
            "VEHICULE_DB_ERROR",
          );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(`[${context}] Prisma validation error: ${error.message}`);
      throw new DomainException(
        "Données invalides pour la création du véhicule",
        400,
        "VEHICULE_VALIDATION_ERROR",
      );
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      this.logger.error(`[${context}] Prisma unknown error: ${error.message}`);
      throw new DomainException(
        "Erreur de connexion à la base de données",
        500,
        "VEHICULE_DB_CONNECTION_ERROR",
      );
    }

    if (error instanceof DomainException) {
      throw error;
    }

    this.logger.error(`[${context}] Unexpected error`, error as Error);
    throw new DomainException(
      "Erreur lors de la création du véhicule",
      500,
      "VEHICULE_CREATION_ERROR",
    );
  }
}
