import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { buildPaged, parsePaginationParams } from '../../../common/utils/pagination-helper.util';
import { VehiculeResponseDto } from '../../vehicule/dto/vehicule-response.dto';
import { ADMIN_REPOSITORY_PORT, AdminRepositoryPort } from '../admin.repository.port';
import { AdminInputValidator } from '../validation/admin-input.validator';

import { AdminAccessPolicy } from './admin-access.policy';
import { AdminMapper } from './admin.mapper';


/**
 * Admin Vehicle Management Service - Single Responsibility for vehicle/annonce management
 * Handles vehicle validation, deactivation, and deletion
 */
@Injectable()
export class AdminVehicleManagementService {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT) private readonly repository: AdminRepositoryPort,
    private readonly inputValidator: AdminInputValidator,
    private readonly accessPolicy: AdminAccessPolicy,
    private readonly mapper: AdminMapper,
  ) {}

  /**
   * Get all vehicles with pagination
   */
  async getAllAnnonces(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<VehiculeResponseDto>> {
    await this.ensureAdmin(user);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size);
    const parsedSortDir = this.inputValidator.parseSortDir(sortDir);

    const { items, total } = await this.repository.findVehiculesPaged(safePage, safeSize, sortBy, parsedSortDir);
    return buildPaged(
      items.map((v) => this.mapper.toVehiculeResponse(v)),
      safePage,
      safeSize,
      total,
    );
  }

  /**
   * Validate/publish a vehicle announcement
   */
  async validerAnnonce(annonceId: string, user: AuthenticatedUser): Promise<VehiculeResponseDto> {
    await this.ensureAdmin(user);
    const found = await this.repository.findVehiculeById(annonceId);
    if (!found) throw new DomainException('Annonce non trouvée', 404, 'ANNONCE_NOT_FOUND');

    const saved = await this.repository.updateVehicule(annonceId, { statut: 'PUBLIE' });
    return this.mapper.toVehiculeResponse(saved);
  }

  /**
   * Deactivate a vehicle announcement
   */
  async desactiverAnnonce(
    annonceId: string,
    raison: string,
    user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    await this.ensureAdmin(user);
    const raisonNettoyee = this.inputValidator.requireReason(raison);
    const found = await this.repository.findVehiculeById(annonceId);
    if (!found) throw new DomainException('Annonce non trouvée', 404, 'ANNONCE_NOT_FOUND');

    const saved = await this.repository.updateVehicule(annonceId, { statut: 'SUPPRIME' });
    await this.notifyUtilisateur(found.proprietaireId, 'ANNONCE_DESACTIVEE', `Votre annonce a été désactivée. Raison: ${raisonNettoyee}`);
    return this.mapper.toVehiculeResponse(saved);
  }

  /**
   * Delete a vehicle announcement
   */
  async supprimerAnnonce(annonceId: string, user: AuthenticatedUser): Promise<void> {
    await this.ensureAdmin(user);
    const found = await this.repository.findVehiculeById(annonceId);
    if (!found) throw new DomainException('Annonce non trouvée', 404, 'ANNONCE_NOT_FOUND');

    await this.notifyUtilisateur(found.proprietaireId, 'ANNONCE_SUPPRIMEE', 'Votre annonce a été supprimée par l\'administrateur.');
    await this.repository.deleteVehicule(annonceId);
  }

  // Private helpers

  private async ensureAdmin(user: AuthenticatedUser): Promise<void> {
    const current = await this.repository.findUserByEmail(user.email);
    this.accessPolicy.assertAdmin(current);
  }

  private async notifyUtilisateur(utilisateurId: string, type: string, message: string): Promise<void> {
    await this.repository.createNotification({
      id: this.repository.newId(),
      utilisateur: { connect: { id: utilisateurId } },
      titre: type,
      message,
      type: 'ABONNEMENT',
      estLu: false,
      dateCreation: new Date(),
      referenceType: type,
    });
  }
}
