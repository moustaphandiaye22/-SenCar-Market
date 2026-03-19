import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { normalizeOptionalField, normalizeRequiredField } from '../../common/utils/field.util';
import { toNullableNumber } from '../../common/utils/number.util';
import { buildPaginatedResponse, clampPage, clampSize } from '../../common/utils/pagination.util';

import { AssociateServiceRequestDto } from './dto/associate-service-request.dto';
import { CreateGarageRequestDto } from './dto/create-garage-request.dto';
import { CreateServiceGarageRequestDto } from './dto/create-service-garage-request.dto';
import { GarageResponseDto } from './dto/garage-response.dto';
import { GarageServiceResponseDto } from './dto/garage-service-response.dto';
import { ServiceGarageResponseDto } from './dto/service-garage-response.dto';
import { ValidationGarageRequestDto } from './dto/validation-garage-request.dto';
import { GarageRecord, UserRecord } from './garage.models';
import { GARAGE_REPOSITORY_PORT, GarageRepositoryPort } from './garage.repository.port';
import { GarageAccessPolicy } from './services/garage-access.policy';
import { GarageMapper } from './services/garage.mapper';
import { StatutValidationGarage } from './types/garage.types';
import { GarageInputValidator } from './validation/garage-input.validator';

@Injectable()
export class GarageService {
  constructor(
    @Inject(GARAGE_REPOSITORY_PORT) private readonly repository: GarageRepositoryPort,
    private readonly inputValidator: GarageInputValidator,
    private readonly accessPolicy: GarageAccessPolicy,
    private readonly mapper: GarageMapper,
  ) {}

  async createGarage(request: CreateGarageRequestDto, user: AuthenticatedUser): Promise<GarageResponseDto> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertHasAnyRole(current.type_utilisateur?.nom, ['PROFESSIONNEL', 'ADMIN']);

    const nom = normalizeRequiredField(request.nom, 'nom', 'GARAGE_INVALID_FIELD');
    const adresse = normalizeRequiredField(request.adresse, 'adresse', 'GARAGE_INVALID_FIELD');
    const telephone = normalizeRequiredField(request.telephone, 'telephone', 'GARAGE_INVALID_FIELD');
    const ville = normalizeRequiredField(request.ville, 'ville', 'GARAGE_INVALID_FIELD');
    const email = normalizeOptionalField(request.email);
    const description = normalizeOptionalField(request.description);
    const horairesOuverture = normalizeOptionalField(request.horairesOuverture);
    const pays = normalizeOptionalField(request.pays);
    const logoUrl = normalizeOptionalField(request.logoUrl);

    const now = new Date();
    const created = await this.repository.createGarage({
      id: this.repository.newId(),
      nom,
      adresse,
      telephone,
      ...(email ? { email } : {}),
      ...(description ? { description } : {}),
      ...(horairesOuverture ? { horairesOuverture } : {}),
      ...(request.latitude != null ? { latitude: request.latitude } : {}),
      ...(request.longitude != null ? { longitude: request.longitude } : {}),
      ville,
      ...(pays ? { pays } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      statut_validation: 'EN_ATTENTE',
      utilisateur_id: current.id,
      created_at: now,
      updated_at: now,
    });

    return this.mapper.toGarageResponse(created);
  }

  async getGarageById(id: string): Promise<GarageResponseDto> {
    const garage = await this.repository.findGarageById(id);
    if (!garage) {
      throw new DomainException('Garage non trouvé', 404, 'GARAGE_NOT_FOUND');
    }
    return this.mapper.toGarageResponse(garage);
  }

  async getAllGarages(page: number, size: number): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.getPagedGarages('all', clampPage(page), clampSize(size, 10));
  }

  async getActiveGarages(page: number, size: number): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.getPagedGarages('ACTIF', clampPage(page), clampSize(size, 10));
  }

  async getGaragesEnAttente(page: number, size: number, user: AuthenticatedUser): Promise<PaginatedResponseDto<GarageResponseDto>> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertAdmin(current.type_utilisateur?.nom);
    return this.getPagedGarages('EN_ATTENTE', clampPage(page), clampSize(size, 10));
  }

  async getGaragesByProprietaire(proprietaireId: string, user: AuthenticatedUser): Promise<GarageResponseDto[]> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertOwnerOrAdmin(current.id, current.type_utilisateur?.nom, proprietaireId);

    const garages = await this.repository.findGaragesByProprietaireId(proprietaireId);
    return garages.map((garage) => this.mapper.toGarageResponse(garage));
  }

  async searchByLocalisation(ville: string): Promise<GarageResponseDto[]> {
    const normalizedVille = normalizeRequiredField(ville, 'ville', 'GARAGE_INVALID_FIELD');
    const garages = await this.repository.findActiveByVille(normalizedVille);
    return garages.map((garage) => this.mapper.toGarageResponse(garage));
  }

  async searchByProximity(latitude: number, longitude: number, rayonKm: number): Promise<GarageResponseDto[]> {
    this.inputValidator.validateProximityInputs(latitude, longitude, rayonKm);
    const bounds = this.calculateSearchBounds(latitude, longitude, rayonKm);
    const garages = await this.repository.findByLocation(bounds[0], bounds[1], bounds[2], bounds[3]);
    return garages.map((garage) => this.mapper.toGarageResponse(garage));
  }

  async searchGarages(query: string): Promise<GarageResponseDto[]> {
    const normalizedQuery = normalizeRequiredField(query, 'query', 'GARAGE_INVALID_FIELD');
    const garages = await this.repository.searchGarages(normalizedQuery);
    return garages.map((garage) => this.mapper.toGarageResponse(garage));
  }

  async updateGarage(id: string, request: CreateGarageRequestDto, user: AuthenticatedUser): Promise<GarageResponseDto> {
    const current = await this.requireCurrentUser(user);
    const garage = await this.requireGarage(id);
    this.accessPolicy.assertGarageOwnerOrAdmin(garage, current.id, current.type_utilisateur?.nom);

    const nom = normalizeRequiredField(request.nom, 'nom', 'GARAGE_INVALID_FIELD');
    const adresse = normalizeRequiredField(request.adresse, 'adresse', 'GARAGE_INVALID_FIELD');
    const telephone = normalizeRequiredField(request.telephone, 'telephone', 'GARAGE_INVALID_FIELD');
    const ville = normalizeRequiredField(request.ville, 'ville', 'GARAGE_INVALID_FIELD');
    const email = normalizeOptionalField(request.email);
    const description = normalizeOptionalField(request.description);
    const horairesOuverture = normalizeOptionalField(request.horairesOuverture);
    const pays = normalizeOptionalField(request.pays);

    const saved = await this.repository.updateGarage(id, {
      nom,
      adresse,
      telephone,
      ...(email ? { email } : {}),
      ...(description ? { description } : {}),
      ...(horairesOuverture ? { horairesOuverture } : {}),
      ...(request.latitude != null ? { latitude: request.latitude } : {}),
      ...(request.longitude != null ? { longitude: request.longitude } : {}),
      ville,
      ...(pays ? { pays } : {}),
      updated_at: new Date(),
    });

    return this.mapper.toGarageResponse(saved);
  }

  async deleteGarage(id: string, user: AuthenticatedUser): Promise<void> {
    const current = await this.requireCurrentUser(user);
    const garage = await this.requireGarage(id);
    this.accessPolicy.assertGarageOwnerOrAdmin(garage, current.id, current.type_utilisateur?.nom);

    const associations = await this.repository.findAssociationsByGarageId(id);
    await this.repository.deleteManyAssociations(associations.map((a) => a.id));
    await this.repository.deleteGarage(id);
  }

  async validerGarage(id: string, request: ValidationGarageRequestDto, user: AuthenticatedUser): Promise<GarageResponseDto> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertAdmin(current.type_utilisateur?.nom);

    const garage = await this.requireGarage(id);
    this.inputValidator.validateStatutTransition(
      garage.statut_validation as StatutValidationGarage | null,
      request.nouveauStatut,
    );

    const saved = await this.repository.updateGarage(id, {
      statut_validation: request.nouveauStatut,
      ...(request.commentaireAdmin !== undefined ? { commentaire_admin: request.commentaireAdmin } : {}),
      date_validation: new Date(),
      updated_at: new Date(),
    });

    return this.mapper.toGarageResponse(saved);
  }

  async updateLogo(id: string, logoUrl: string, user: AuthenticatedUser): Promise<GarageResponseDto> {
    const current = await this.requireCurrentUser(user);
    const garage = await this.requireGarage(id);
    this.accessPolicy.assertGarageOwnerOrAdmin(garage, current.id, current.type_utilisateur?.nom);
    const normalizedLogoUrl = normalizeRequiredField(logoUrl, 'logoUrl', 'GARAGE_INVALID_FIELD');

    const saved = await this.repository.updateGarage(id, {
      logo_url: normalizedLogoUrl,
      updated_at: new Date(),
    });
    return this.mapper.toGarageResponse(saved);
  }

  async createService(request: CreateServiceGarageRequestDto, user: AuthenticatedUser): Promise<ServiceGarageResponseDto> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertAdmin(current.type_utilisateur?.nom);

    const now = new Date();
    const saved = await this.repository.createService({
      id: this.repository.newId(),
      nom: request.nom,
      ...(request.description ? { description: request.description } : {}),
      ...(request.prix != null ? { prix: request.prix } : {}),
      ...(request.dureeEstimee != null ? { dureeEstimee: request.dureeEstimee } : {}),
      ...(request.categorie ? { categorie: request.categorie } : {}),
      actif: true,
      created_at: now,
      updated_at: now,
    });

    return this.mapper.toServiceResponse(saved);
  }

  async getAllServices(): Promise<ServiceGarageResponseDto[]> {
    const services = await this.repository.findServicesActifs();
    return services.map((service) => this.mapper.toServiceResponse(service));
  }

  async getServiceById(id: string): Promise<ServiceGarageResponseDto> {
    const service = await this.repository.findServiceById(id);
    if (!service) {
      throw new DomainException('Service non trouvé', 404, 'GARAGE_SERVICE_NOT_FOUND');
    }
    return this.mapper.toServiceResponse(service);
  }

  async associateService(
    garageId: string,
    request: AssociateServiceRequestDto,
    user: AuthenticatedUser,
  ): Promise<GarageServiceResponseDto> {
    const current = await this.requireCurrentUser(user);
    const garage = await this.requireGarage(garageId);
    this.accessPolicy.assertGarageOwnerOrAdmin(garage, current.id, current.type_utilisateur?.nom);

    const service = await this.repository.findServiceById(request.serviceId);
    if (!service) {
      throw new DomainException('Service non trouvé', 404, 'GARAGE_SERVICE_NOT_FOUND');
    }
    if (service.actif !== true) {
      throw new DomainException('Service inactif', 400, 'GARAGE_SERVICE_INACTIVE');
    }

    const existing = await this.repository.findAssociationByGarageAndService(garageId, request.serviceId);
    if (existing) {
      throw new DomainException('Service déjà associé à ce garage', 409, 'GARAGE_SERVICE_ALREADY_ASSOCIATED');
    }

    const now = new Date();
    const prix = request.prix ?? toNullableNumber(service.prix) ?? undefined;
    const saved = await this.repository.createAssociation({
      id: this.repository.newId(),
      garage: { connect: { id: garageId } },
      service_garage: { connect: { id: request.serviceId } },
      ...(prix !== undefined ? { prix } : {}),
      duree_estimee: request.dureeEstimee ?? service.duree_estimee ?? undefined,
      actif: true,
      created_at: now,
      updated_at: now,
    });

    return this.mapper.toAssociationResponse(saved);
  }

  async getServicesByGarage(garageId: string): Promise<GarageServiceResponseDto[]> {
    await this.requireGarage(garageId);
    const services = await this.repository.findServicesByGarageId(garageId);
    return services.map((service) => this.mapper.toAssociationResponse(service));
  }

  async disassociateService(garageId: string, serviceId: string, user: AuthenticatedUser): Promise<void> {
    const current = await this.requireCurrentUser(user);
    const garage = await this.requireGarage(garageId);
    this.accessPolicy.assertGarageOwnerOrAdmin(garage, current.id, current.type_utilisateur?.nom);

    const association = await this.repository.findAssociationByGarageAndService(garageId, serviceId);
    if (!association) {
      throw new DomainException('Association garage/service non trouvée', 404, 'GARAGE_SERVICE_ASSOCIATION_NOT_FOUND');
    }

    await this.repository.deleteAssociation(association.id);
  }

  private async getPagedGarages(
    mode: 'all' | StatutValidationGarage,
    page: number,
    size: number,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    const data =
      mode === 'all'
        ? await this.repository.findGaragesPaged(page, size)
        : await this.repository.findGaragesByStatutPaged(mode, page, size);

    return buildPaginatedResponse(
      data.items.map((item) => this.mapper.toGarageResponse(item)),
      page,
      size,
      data.total,
    );
  }

  private async requireCurrentUser(user: AuthenticatedUser): Promise<UserRecord> {
    const current = await this.repository.findUserByEmail(user.email);
    if (!current) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return current;
  }

  private async requireGarage(garageId: string): Promise<GarageRecord> {
    const garage = await this.repository.findGarageById(garageId);
    if (!garage) {
      throw new DomainException('Garage non trouvé', 404, 'GARAGE_NOT_FOUND');
    }
    return garage;
  }

  private calculateSearchBounds(latitude: number, longitude: number, rayonKm: number): [number, number, number, number] {
    const latDelta = rayonKm / 111.0;
    const lonDelta = rayonKm / (111.0 * Math.cos((latitude * Math.PI) / 180));
    return [latitude - latDelta, latitude + latDelta, longitude - lonDelta, longitude + lonDelta];
  }

}
