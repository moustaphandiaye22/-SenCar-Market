import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, join } from 'path';

import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { normalizeOptionalField, normalizeRequiredField } from '../../common/utils/field.util';
import { buildPaged, parsePaginationParams } from '../../common/utils/pagination-helper.util';

import { CreateVehiculeRequestDto } from './dto/create-vehicule-request.dto';
import { UpdateVehiculeRequestDto } from './dto/update-vehicule-request.dto';
import { VehiculeFilterDto } from './dto/vehicule-filter.dto';
import { VehiculeResponseDto } from './dto/vehicule-response.dto';
import { VehiculeAccessPolicy } from './services/vehicule-access.policy';
import { VehiculeMapper } from './services/vehicule.mapper';
import { VehiculeInputValidator } from './validation/vehicule-input.validator';
import { UserWithRoleRecord, VehiculeFavoriRecord, VehiculeRecord, UpdateVehiculeInput } from './vehicule.models';
import { VEHICULE_REPOSITORY_PORT, VehiculeRepositoryPort } from './vehicule.repository.port';

type UploadedFileLike = { originalname?: string; buffer: Buffer };

@Injectable()
export class VehiculeService {
  constructor(
    @Inject(VEHICULE_REPOSITORY_PORT) private readonly repository: VehiculeRepositoryPort,
    private readonly inputValidator: VehiculeInputValidator,
    private readonly accessPolicy: VehiculeAccessPolicy,
    private readonly mapper: VehiculeMapper,
  ) {}

  async createVehicule(
    request: CreateVehiculeRequestDto,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    this.accessPolicy.assertCanCreate(currentUser.typeUtilisateur?.nom);
    const couleur = normalizeRequiredField(request.couleur, 'couleur', 'VEHICULE_INVALID_FIELD');
    const numeroVin = normalizeRequiredField(request.numeroVin, 'numeroVin', 'VEHICULE_INVALID_FIELD');
    const description = normalizeOptionalField(request.description);
    const immatriculation = normalizeOptionalField(request.immatriculation);
    const photosUrls = this.inputValidator.normalizePhotosUrls(request.photosUrls);

    const marque = await this.repository.findOrCreateMarque(request.marque);
    const modele = await this.repository.findOrCreateModele(marque.id, request.modele);

    const [carburant, boiteVitesse] = await Promise.all([
      this.repository.findCarburantById(request.carburantId),
      this.repository.findBoiteVitesseById(request.boiteVitesseId),
    ]);

    if (!carburant) throw new DomainException('Carburant non trouvé', 404, 'CARBURANT_NOT_FOUND');
    if (!boiteVitesse)
      throw new DomainException('Boîte de vitesse non trouvée', 404, 'BOITE_VITESSE_NOT_FOUND');


    const statut = request.enregistrerEnBrouillon ? 'BROUILLON' : 'PUBLIE';
    const vehicule = await this.repository.createVehicule({
      id: randomUUID(),
      proprietaire: { connect: { id: currentUser.id } },
      marque: { connect: { id: marque.id } },
      modele: { connect: { id: modele.id } },
      anneeFabrication: request.anneeFabrication,
      kilometrage: request.kilometrage,
      carburant: { connect: { id: request.carburantId } },
      boiteVitesse: { connect: { id: request.boiteVitesseId } },
      couleur,
      prixVente: request.prixVente,
      ...(description !== undefined ? { description } : {}),
      numeroVin,
      ...(immatriculation !== undefined ? { immatriculation } : {}),
      prixNegociable: request.prixNegociable ?? false,
      certifie: request.certifie ?? false,
      statut,
      estBoost: false,
      vues: 0,
      nombreFavoris: 0,
    });

    if (photosUrls.length) {
      await Promise.all(
        photosUrls.map((url, index) =>
          this.repository.createPhoto({
            id: randomUUID(),
            vehicule: { connect: { id: vehicule.id } },
            url,
            estPrincipale: index === 0,
            ordre: index,
          }),
        ),
      );
    }

    const fullVehicule = await this.mustFindVehicule(vehicule.id);
    return this.mapper.toVehiculeResponse(fullVehicule, false);
  }

  async searchVehicules(filter: VehiculeFilterDto): Promise<PaginatedResponseDto<VehiculeResponseDto>> {
    const { page, size } = parsePaginationParams(filter.page ?? 0, filter.size ?? 20, { defaultSize: 20 });

    const sortBy = this.inputValidator.resolveSortBy(filter.sortBy ?? 'createdAt');
    const sortDir = this.inputValidator.parseSortDir(filter.sortDir ?? 'DESC');

    const { items, total } = await this.repository.findPublishedPaged({
      skip: page * size,
      take: size,
      orderBy: { [sortBy]: sortDir },
      marqueId: filter.marqueId,
      modeleId: filter.modeleId,
      q: filter.q,
    });

    return buildPaged(
      items.map((item: VehiculeRecord) => this.mapper.toVehiculeResponse(item, false)),
      page,
      size,
      total,
    );
  }

  async getVehiculeById(id: string, user: AuthenticatedUser): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);
    this.accessPolicy.assertCanReadVehicule(vehicule, currentUser.id, currentUser.typeUtilisateur?.nom);

    const views = (vehicule.vues ?? 0) + 1;
    await this.repository.updateVehicule(id, { vues: views });

    const isFavori = Boolean(await this.repository.isFavori(currentUser.id, id));
    return this.mapper.toVehiculeResponse({ ...vehicule, vues: views }, isFavori);
  }

  async getMesVehicules(user: AuthenticatedUser): Promise<VehiculeResponseDto[]> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicules = await this.repository.findByProprietaireId(currentUser.id);

    return vehicules.map((v: VehiculeRecord) => this.mapper.toVehiculeResponse(v, false));
  }

  async publishVehicule(id: string, user: AuthenticatedUser): Promise<VehiculeResponseDto> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);

    this.accessPolicy.assertAdminOrOwner(currentUser.typeUtilisateur?.nom, currentUser.id, vehicule.proprietaireId);

    await this.repository.updateVehicule(id, { statut: 'PUBLIE' });
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
      currentUser.typeUtilisateur?.nom,
      currentUser.id,
      vehicule.proprietaireId,
    );

    const updateData: UpdateVehiculeInput = {};

    if (request.marque) {
      const marque = await this.repository.findOrCreateMarque(request.marque);
      updateData.marque = { connect: { id: marque.id } };
    }

    if (request.modele) {
      const marqueIdToUse = updateData.marque?.connect?.id || vehicule.marqueId;
      if (!marqueIdToUse) {
        throw new DomainException('Impossible de définir le modèle sans marque', 400, 'NO_MARQUE_FOR_MODELE');
      }
      const modele = await this.repository.findOrCreateModele(marqueIdToUse, request.modele);
      updateData.modele = { connect: { id: modele.id } };
    }

    if (request.carburantId) {
      const carburant = await this.repository.findCarburantById(request.carburantId);
      if (!carburant) throw new DomainException('Carburant non trouvé', 404, 'CARBURANT_NOT_FOUND');
      updateData.carburant = { connect: { id: request.carburantId } };
    }

    if (request.boiteVitesseId) {
      const boiteVitesse = await this.repository.findBoiteVitesseById(request.boiteVitesseId);
      if (!boiteVitesse)
        throw new DomainException('Boîte de vitesse non trouvée', 404, 'BOITE_VITESSE_NOT_FOUND');
      updateData.boiteVitesse = { connect: { id: request.boiteVitesseId } };
    }

    if (request.anneeFabrication) updateData.anneeFabrication = request.anneeFabrication;
    if (request.kilometrage !== undefined) updateData.kilometrage = request.kilometrage;
    if (request.couleur)
      updateData.couleur = normalizeRequiredField(request.couleur, 'couleur', 'VEHICULE_INVALID_FIELD');
    if (request.prixVente) updateData.prixVente = request.prixVente;
    if (request.description !== undefined)
      updateData.description = normalizeOptionalField(request.description);
    if (request.numeroVin)
      updateData.numeroVin = normalizeRequiredField(
        request.numeroVin,
        'numeroVin',
        'VEHICULE_INVALID_FIELD',
      );
    if (request.immatriculation !== undefined)
      updateData.immatriculation = normalizeOptionalField(request.immatriculation);
    if (request.prixNegociable !== undefined) updateData.prixNegociable = request.prixNegociable;
    if (request.certifie !== undefined) updateData.certifie = request.certifie;

    if (request.enregistrerEnBrouillon !== undefined) {
      updateData.statut = request.enregistrerEnBrouillon ? 'BROUILLON' : 'PUBLIE';
    }

    await this.repository.updateVehicule(id, updateData);

    const updated = await this.mustFindVehicule(id);
    const isFavori = Boolean(await this.repository.isFavori(currentUser.id, id));
    return this.mapper.toVehiculeResponse(updated, isFavori);
  }

  async deleteVehicule(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);

    this.accessPolicy.assertAdminOrOwner(currentUser.typeUtilisateur?.nom, currentUser.id, vehicule.proprietaireId);
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
    const favoris = await this.repository.findFavorisByUtilisateur(currentUser.id);

    return favoris.map((favori: VehiculeFavoriRecord) =>
      this.mapper.toVehiculeResponse(favori.vehicule, true),
    );
  }

  async getAllMarques(): Promise<{ id: string; nom: string }[]> {
    return this.repository.findAllMarques();
  }

  async getModelesByMarque(marqueId: string): Promise<{ id: string; nom: string }[]> {
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
    const { debut, fin } = this.inputValidator.parseBoostDates(debutIso, finIso);

    const currentUser = await this.mustFindUser(user.email);
    const vehicule = await this.mustFindVehicule(id);
    this.accessPolicy.assertAdminOrOwner(currentUser.typeUtilisateur?.nom, currentUser.id, vehicule.proprietaireId);

    await this.repository.updateVehicule(id, {
      estBoost: true,
      boostDebut: debut,
      boostFin: fin,
    });

    const updated = await this.mustFindVehicule(id);
    return this.mapper.toVehiculeResponse(updated, false);
  }

  async uploadPhotos(files: UploadedFileLike[]): Promise<string[]> {
    if (!files || !files.length) {
      throw new DomainException('Fichiers images requis', 400, 'VEHICULE_PHOTOS_REQUIRED');
    }
    const uploadDir = join(process.cwd(), 'uploads', 'vehicules');
    await mkdir(uploadDir, { recursive: true });
    
    const urls: string[] = [];
    for (const file of files) {
      if (!file?.buffer?.length) continue;
      const safeOriginal = basename(file.originalname || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${randomUUID()}_${safeOriginal}`;
      const filePath = join(uploadDir, filename);

      await writeFile(filePath, file.buffer);
      urls.push(`/uploads/vehicules/${filename}`);
    }
    return urls;
  }

  private async refreshNombreFavoris(vehiculeId: string): Promise<void> {
    const vehicule = await this.repository.findVehiculeById(vehiculeId);
    if (!vehicule) {
      return;
    }

    const count = await this.repository.countFavoris(vehiculeId);
    await this.repository.updateVehicule(vehiculeId, { nombreFavoris: count });
  }

  private async mustFindUser(email: string): Promise<UserWithRoleRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  private async mustFindVehicule(id: string): Promise<VehiculeRecord> {
    const vehicule = await this.repository.findVehiculeById(id);
    if (!vehicule) {
      throw new DomainException('Véhicule non trouvé', 404, 'VEHICULE_NOT_FOUND');
    }

    return vehicule;
  }

}
