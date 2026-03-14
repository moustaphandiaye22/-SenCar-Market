import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { buildPaginatedResponse, clampPage, clampSize } from '../../common/utils/pagination.util';

import { CreateDemandeTradeInRequestDto } from './dto/create-demande-tradein-request.dto';
import { DemandeTradeInResponseDto } from './dto/demande-tradein-response.dto';
import { EstimationRequestDto } from './dto/estimation-request.dto';
import { EstimationResponseDto } from './dto/estimation-response.dto';
import { ValidationRequestDto } from './dto/validation-request.dto';
import { TradeInEstimationService } from './services/tradein-estimation.service';
import { TradeInSecurityService } from './services/tradein-security.service';
import { TradeInWorkflowService } from './services/tradein-workflow.service';
import { TradeInMapper } from './services/tradein.mapper';
import { DemandeRecord, UserRecord } from './tradein.models';
import { TRADEIN_REPOSITORY_PORT, TradeInRepositoryPort } from './tradein.repository.port';
import { STATUT_TRADEIN_VALUES, StatutTradeIn } from './types/tradein.types';
import { TradeInStatusValidator } from './validation/tradein-status.validator';

@Injectable()
export class TradeInService {
  constructor(
    @Inject(TRADEIN_REPOSITORY_PORT) private readonly repository: TradeInRepositoryPort,
    private readonly securityService: TradeInSecurityService,
    private readonly workflowService: TradeInWorkflowService,
    private readonly estimationService: TradeInEstimationService,
    private readonly inputValidator: TradeInStatusValidator,
    private readonly mapper: TradeInMapper,
  ) {}

  async createDemande(request: CreateDemandeTradeInRequestDto, user: AuthenticatedUser): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const etatVehicule = this.estimationService.normalizeEtatVehicule(request.etatVehicule);

    let vehiculeId = request.vehiculeActuelId;
    if (!vehiculeId) {
      if (!request.marque || !request.modele) {
        throw new DomainException('Marque et modèle requis si le véhicule n\'est pas spécifié', 400, 'TRADEIN_VEHICLE_INFO_REQUIRED');
      }
      vehiculeId = await this.repository.findOrCreateVehicule(
        current.id,
        request.marque || '',
        request.modele || '',
        request.anneeFabrication || new Date().getFullYear(),
        request.kilometrageActuel || request.kilometrage || 0,
      );
    } else {
      const vehiculeActuel = await this.repository.findVehiculeById(vehiculeId);
      if (!vehiculeActuel) {
        throw new DomainException('Véhicule actuel non trouvé', 404, 'VEHICULE_NOT_FOUND');
      }
    }

    const now = new Date();
    const created = await this.repository.createDemande({
      id: this.repository.newId(),
      utilisateur: { connect: { id: current.id } },
      vehiculeActuel: { connect: { id: vehiculeId } },
      ...(request.vehiculeSouhaiteId ? { vehiculeSouhaite: { connect: { id: request.vehiculeSouhaiteId } } } : {}),
      statut: 'EN_ATTENTE',
      kilometrageActuel: request.kilometrageActuel || request.kilometrage || 0,
      etatVehicule,
      dateSoumission: now,
      estNotifie: false,
      createdAt: now,
      updatedAt: now,
    });

    await this.sendTradeInNotification(current.id, 'Trade-In', 'EN_ATTENTE - Votre demande est en attente d\'évaluation');

    return this.mapper.toDemandeResponse(created);
  }

  async getAllDemandes(page: number, size: number, user: AuthenticatedUser): Promise<PaginatedResponseDto<DemandeTradeInResponseDto>> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureAdminOrModerator(current.typeUtilisateur?.nom);

    const safePage = clampPage(page);
    const safeSize = clampSize(size, 10);
    const { items, total } = await this.repository.findDemandesPaged(safePage, safeSize);
    return buildPaginatedResponse(
      items.map((item) => this.mapper.toDemandeResponse(item)),
      safePage,
      safeSize,
      total,
    );
  }

  async getDemandeById(id: string, user: AuthenticatedUser): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(id);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateurId);
    return this.mapper.toDemandeResponse(demande);
  }

  async getDemandesByUtilisateur(utilisateurId: string, user: AuthenticatedUser): Promise<DemandeTradeInResponseDto[]> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureOwnerOrAdmin(current, utilisateurId);

    const demandes = await this.repository.findDemandesByUtilisateurId(utilisateurId);
    return demandes.map((demande) => this.mapper.toDemandeResponse(demande));
  }

  async updateDemande(
    id: string,
    request: CreateDemandeTradeInRequestDto,
    user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(id);
    const etatVehicule = this.estimationService.normalizeEtatVehicule(request.etatVehicule);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateurId);

    if (demande.statut !== 'EN_ATTENTE') {
      throw new DomainException('Seule une demande EN_ATTENTE peut être modifiée', 400, 'TRADEIN_ONLY_PENDING_UPDATE');
    }

    this.estimationService.assertEtatVehiculeValid(etatVehicule);

    const updated = await this.repository.updateDemande(id, {
      kilometrageActuel: request.kilometrageActuel,
      etatVehicule,
      updatedAt: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async deleteDemande(id: string, user: AuthenticatedUser): Promise<void> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(id);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateurId);

    if (demande.statut === 'ACCEPTE') {
      throw new DomainException('Impossible de supprimer une demande acceptée', 400, 'TRADEIN_CANNOT_DELETE_ACCEPTED');
    }

    await this.repository.deleteDemande(id);
  }

  async estimerVehicule(request: EstimationRequestDto): Promise<EstimationResponseDto> {
    const etatVehicule = this.estimationService.normalizeEtatVehicule(request.etatVehicule);
    this.estimationService.assertEtatVehiculeValid(etatVehicule);

    if (request.vehiculeId) {
      const vehicule = await this.repository.findVehiculeById(request.vehiculeId);
      if (!vehicule) {
        throw new DomainException('Véhicule non trouvé', 404, 'VEHICULE_NOT_FOUND');
      }
      return this.estimationService.calculateEstimation(vehicule, request.kilometrage, etatVehicule);
    } else {
      // Logic for estimation without existing vehicle
      const mockVehicule = {
        id: 'external',
        anneeFabrication: request.anneeFabrication ?? new Date().getFullYear(),
        prixVente: 10000000, // Consider a default market value or add it to request
        marque: { nom: request.marque ?? 'Inconnu' },
        modele: { nom: request.modele ?? 'Inconnu' },
      };
      return this.estimationService.calculateEstimation(mockVehicule, request.kilometrage, etatVehicule);
    }
  }

  async calculerEstimationAuto(demandeId: string, user: AuthenticatedUser): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(demandeId);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateurId);
    this.workflowService.validateTransition(demande.statut as StatutTradeIn, 'EVALUATION_TERMINEE');

    const estimation = this.estimationService.calculateEstimation(
      demande.vehiculeActuel,
      demande.kilometrageActuel ?? 0,
      this.estimationService.normalizeEtatVehicule(demande.etatVehicule ?? 'moyen'),
    );

    const now = new Date();
    const updated = await this.repository.updateDemande(demandeId, {
      prixEstime: estimation.prixEstime,
      statut: 'EVALUATION_TERMINEE',
      dateEvaluation: now,
      updatedAt: now,
    });

    await this.repository.createHistoriqueEstimation({
      id: this.repository.newId(),
      vehiculeId: demande.vehiculeActuel.id,
      marque: demande.vehiculeActuel.marque?.nom ?? 'Inconnu',
      modele: demande.vehiculeActuel.modele?.nom ?? 'Inconnu',
      ...(demande.vehiculeActuel.anneeFabrication != null ? { anneeFabrication: demande.vehiculeActuel.anneeFabrication } : {}),
      kilometrage: estimation.kilometrage,
      etatVehicule: estimation.etatVehicule,
      prixEstime: estimation.prixEstime,
      prixMinimum: estimation.prixMinimum,
      prixMaximum: estimation.prixMaximum,
      scoreCondition: estimation.scoreCondition,
      recommandation: estimation.recommandation,
      dateEstimation: now,
    });

    await this.sendTradeInNotification(
      updated.utilisateurId,
      'Estimation',
      `EVALUATION_TERMINEE - Votre estimation est prête: ${estimation.prixEstime} XOF`,
    );

    return this.mapper.toDemandeResponse(updated);
  }

  async validerDemande(
    id: string,
    request: ValidationRequestDto,
    user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureAdminOrModerator(current.typeUtilisateur?.nom);

    const demande = await this.requireDemande(id);
    this.workflowService.validateTransition(demande.statut as StatutTradeIn, request.nouveauStatut);

    const now = new Date();
    const updated = await this.repository.updateDemande(id, {
      statut: request.nouveauStatut,
      ...(request.prixPropose != null ? { prixPropose: request.prixPropose } : {}),
      ...(request.commentaireAdmin != null ? { commentaireAdmin: request.commentaireAdmin } : {}),
      ...(request.motifRejet != null ? { motifRejet: request.motifRejet } : {}),
      dateTraitement: now,
      updatedAt: now,
    });

    const message = `${request.nouveauStatut} - ${request.commentaireAdmin ?? ''}`.trim();
    await this.sendTradeInNotification(updated.utilisateurId, 'Validation', message);

    return this.mapper.toDemandeResponse(updated);
  }

  async updateStatut(id: string, nouveauStatut: StatutTradeIn, user: AuthenticatedUser): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureAdminOrModerator(current.typeUtilisateur?.nom);

    const demande = await this.requireDemande(id);
    this.workflowService.validateTransition(demande.statut as StatutTradeIn, nouveauStatut);

    const updated = await this.repository.updateDemande(id, {
      statut: nouveauStatut,
      dateTraitement: new Date(),
      updatedAt: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async updateStatutFromRaw(
    id: string,
    rawStatut: string,
    user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    const statut = this.inputValidator.parseStatus(rawStatut);
    return this.updateStatut(id, statut, user);
  }

  async notifierUtilisateur(id: string, user: AuthenticatedUser): Promise<DemandeTradeInResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureAdminOrModerator(current.typeUtilisateur?.nom);

    const demande = await this.requireDemande(id);

    await this.sendTradeInNotification(demande.utilisateurId, 'Notification', demande.statut);

    const updated = await this.repository.updateDemande(id, {
      estNotifie: true,
      updatedAt: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async getDemandesNonNotifiees(user: AuthenticatedUser): Promise<DemandeTradeInResponseDto[]> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureAdminOrModerator(current.typeUtilisateur?.nom);

    const demandes = await this.repository.findDemandesByNotifie(false);
    return demandes.map((demande) => this.mapper.toDemandeResponse(demande));
  }

  private async requireCurrentUser(email: string): Promise<UserRecord> {
    const current = await this.repository.findUserByEmail(email);
    if (!current) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return current;
  }

  private async requireDemande(id: string): Promise<DemandeRecord> {
    const demande = await this.repository.findDemandeById(id);
    if (!demande) {
      throw new DomainException('Demande trade-in non trouvée', 404, 'TRADEIN_REQUEST_NOT_FOUND');
    }
    if (!STATUT_TRADEIN_VALUES.includes(demande.statut as (typeof STATUT_TRADEIN_VALUES)[number])) {
      throw new DomainException('Statut trade-in invalide', 500, 'TRADEIN_STATUS_INVALID_STORED');
    }
    return demande;
  }

  private async sendTradeInNotification(utilisateurId: string, title: string, message: string): Promise<void> {
    await this.repository.createNotification({
      id: this.repository.newId(),
      utilisateur: { connect: { id: utilisateurId } },
      titre: title,
      message,
      type: 'TRADE_IN',
      estLu: false,
      dateCreation: new Date(),
    });
  }

}
