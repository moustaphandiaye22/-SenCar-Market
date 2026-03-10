import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { buildPaginatedResponse, clampPage, clampSize } from '../../common/utils/pagination.util';

import { AvisRecord } from './avis.models';
import { AVIS_REPOSITORY_PORT, AvisRepositoryPort } from './avis.repository.port';
import { AvisResponseDto } from './dto/avis-response.dto';
import { CreateAvisRequestDto } from './dto/create-avis-request.dto';
import { AvisMapper } from './services/avis.mapper';
import { StatutAvis, TYPE_AVIS_VALUES } from './types/avis.types';
import { AvisInputValidator } from './validation/avis-input.validator';

@Injectable()
export class AvisService {
  constructor(
    @Inject(AVIS_REPOSITORY_PORT) private readonly repository: AvisRepositoryPort,
    private readonly inputValidator: AvisInputValidator,
    private readonly mapper: AvisMapper,
  ) {}

  async createAvis(request: CreateAvisRequestDto, user: AuthenticatedUser): Promise<AvisResponseDto> {
    const auteur = await this.repository.findUserByEmail(user.email);
    if (!auteur) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    this.inputValidator.validateCreateAvisRequest(request);

    if (await this.repository.existsByTransactionAndAuteur(request.transactionId, auteur.id)) {
      throw new DomainException('Un avis existe déjà pour cette transaction', 400, 'AVIS_ALREADY_EXISTS_FOR_TRANSACTION');
    }

    if (request.cibleUtilisateurId) {
      const cible = await this.repository.findUserById(request.cibleUtilisateurId);
      if (!cible) throw new DomainException('Utilisateur cible non trouvé', 404, 'TARGET_USER_NOT_FOUND');
      if (cible.id === auteur.id) {
        throw new DomainException('Vous ne pouvez pas vous auto-noter', 400, 'AVIS_CANNOT_RATE_SELF');
      }
    }

    if (request.vehiculeId) {
      const vehicule = await this.repository.findVehiculeById(request.vehiculeId);
      if (!vehicule) throw new DomainException('Véhicule non trouvé', 404, 'VEHICULE_NOT_FOUND');
    }
    if (request.garageId) {
      const garage = await this.repository.findGarageById(request.garageId);
      if (!garage) throw new DomainException('Garage non trouvé', 404, 'GARAGE_NOT_FOUND');
    }

    if (!(await this.isTransactionValide(request.transactionId, request.typeAvis))) {
      throw new DomainException('Transaction invalide pour cet avis', 400, 'INVALID_TRANSACTION');
    }

    const created = await this.repository.createAvis({
      id: this.repository.newId(),
      auteur: { connect: { id: auteur.id } },
      ...(request.cibleUtilisateurId ? { cibleUtilisateur: { connect: { id: request.cibleUtilisateurId } } } : {}),
      ...(request.vehiculeId ? { vehicule: { connect: { id: request.vehiculeId } } } : {}),
      ...(request.garageId ? { garageId: request.garageId } : {}),
      typeAvis: request.typeAvis,
      transactionId: request.transactionId,
      note: request.note,
      commentaire: request.commentaire,
      statut: 'PUBLIE',
      createdAt: new Date(),
    });

    return this.mapper.toAvisResponse(created);
  }

  async getAvisById(avisId: string): Promise<AvisResponseDto> {
    const found = await this.repository.findAvisById(avisId);
    if (!found) {
      throw new DomainException('Avis non trouvé', 404, 'AVIS_NOT_FOUND');
    }
    return this.mapper.toAvisResponse(found);
  }

  async getAllAvis(page: number, size: number): Promise<PaginatedResponseDto<AvisResponseDto>> {
    const clampedPage = clampPage(page);
    const clampedSize = clampSize(size, 10);
    const statut: StatutAvis = 'PUBLIE';

    const data = await this.repository.findAllAvisPaged(statut, clampedPage, clampedSize);

    return buildPaginatedResponse(
      data.items.map((a: AvisRecord) => this.mapper.toAvisResponse(a)),
      clampedPage,
      clampedSize,
      data.total,
    );
  }

  async getAvisByUtilisateur(utilisateurId: string, page: number, size: number): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.getPaged('utilisateur', utilisateurId, clampPage(page), clampSize(size, 10));
  }

  async getAvisByVehicule(vehiculeId: string, page: number, size: number): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.getPaged('vehicule', vehiculeId, clampPage(page), clampSize(size, 10));
  }

  async getAvisByGarage(garageId: string, page: number, size: number): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.getPaged('garage', garageId, clampPage(page), clampSize(size, 10));
  }

  async getNoteMoyenneUtilisateur(utilisateurId: string): Promise<number> {
    const moyenne = await this.repository.getNoteMoyenneUtilisateur(utilisateurId);
    return moyenne != null ? Math.round(moyenne * 10) / 10 : 0;
  }

  async getNoteMoyenneVehicule(vehiculeId: string): Promise<number> {
    const moyenne = await this.repository.getNoteMoyenneVehicule(vehiculeId);
    return moyenne != null ? Math.round(moyenne * 10) / 10 : 0;
  }

  async getNoteMoyenneGarage(garageId: string): Promise<number> {
    const moyenne = await this.repository.getNoteMoyenneGarage(garageId);
    return moyenne != null ? Math.round(moyenne * 10) / 10 : 0;
  }

  async signalerAvis(avisId: string, user: AuthenticatedUser): Promise<void> {
    const auteur = await this.repository.findUserByEmail(user.email);
    if (!auteur) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const avis = await this.repository.findAvisById(avisId);
    if (!avis) throw new DomainException('Avis non trouvé', 404, 'AVIS_NOT_FOUND');

    if (avis.auteurId === auteur.id) {
      throw new DomainException('Vous ne pouvez pas signaler votre propre avis', 400, 'AVIS_CANNOT_REPORT_SELF');
    }

    await this.repository.updateAvisStatut(avisId, 'SIGNALEE');
  }

  async deleteAvis(avisId: string, user: AuthenticatedUser): Promise<void> {
    const requester = await this.repository.findUserByEmail(user.email);
    if (!requester) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const avis = await this.repository.findAvisById(avisId);
    if (!avis) throw new DomainException('Avis non trouvé', 404, 'AVIS_NOT_FOUND');

    if (avis.auteurId !== requester.id) {
      throw new DomainException('Seul l\'auteur peut supprimer cet avis', 403, 'AVIS_CANNOT_DELETE');
    }

    await this.repository.updateAvisStatut(avisId, 'SUPPRIMEE');
  }

  async isTransactionValide(transactionId: string, typeAvis: string): Promise<boolean> {
    if (!TYPE_AVIS_VALUES.includes(typeAvis as (typeof TYPE_AVIS_VALUES)[number])) {
      return false;
    }
    const avisExistants = await this.repository.findByTransactionId(transactionId);
    return avisExistants.length === 0 || avisExistants.length < 2;
  }

  private async getPaged(
    mode: 'utilisateur' | 'vehicule' | 'garage',
    id: string,
    page: number,
    size: number,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    let data: { items: AvisRecord[]; total: number };
    const statut: StatutAvis = 'PUBLIE';

    if (mode === 'utilisateur') {
      data = await this.repository.findAvisByUtilisateurPaged(id, statut, page, size);
    } else if (mode === 'vehicule') {
      data = await this.repository.findAvisByVehiculePaged(id, statut, page, size);
    } else {
      data = await this.repository.findAvisByGaragePaged(id, statut, page, size);
    }

    return buildPaginatedResponse(
      data.items.map((a: AvisRecord) => this.mapper.toAvisResponse(a)),
      page,
      size,
      data.total,
    );
  }

}
