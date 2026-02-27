import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { normalizeOptionalField, normalizeRequiredField } from '../../common/utils/field.util';
import { buildPaged, parsePaginationParams } from '../../common/utils/pagination-helper.util';

import { CreateVehiculeRequestDto } from './dto/create-vehicule-request.dto';
import { VehiculeFilterDto } from './dto/vehicule-filter.dto';
import { VehiculeResponseDto } from './dto/vehicule-response.dto';
import { VehiculeAccessPolicy } from './services/vehicule-access.policy';
import { VehiculeMapper } from './services/vehicule.mapper';
import { VehiculeInputValidator } from './validation/vehicule-input.validator';
import { UserWithRoleRecord, VehiculeFavoriRecord, VehiculeRecord } from './vehicule.models';
import { VEHICULE_REPOSITORY_PORT, VehiculeRepositoryPort } from './vehicule.repository.port';

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

    const [marque, modele, carburant, boiteVitesse] = await Promise.all([
      this.repository.findMarqueById(request.marqueId),
      this.repository.findModeleById(request.modeleId),
      this.repository.findCarburantById(request.carburantId),
      this.repository.findBoiteVitesseById(request.boiteVitesseId),
    ]);

    if (!marque) throw new DomainException('Marque non trouvée', 404, 'MARQUE_NOT_FOUND');
    if (!modele) throw new DomainException('Modèle non trouvé', 404, 'MODELE_NOT_FOUND');
    if (!carburant) throw new DomainException('Carburant non trouvé', 404, 'CARBURANT_NOT_FOUND');
    if (!boiteVitesse)
      throw new DomainException('Boîte de vitesse non trouvée', 404, 'BOITE_VITESSE_NOT_FOUND');

    const statut = request.enregistrerEnBrouillon ? 'BROUILLON' : 'PUBLIE';
    const vehicule = await this.repository.createVehicule({
      id: randomUUID(),
      proprietaire: { connect: { id: currentUser.id } },
      marque: { connect: { id: request.marqueId } },
      modele: { connect: { id: request.modeleId } },
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
