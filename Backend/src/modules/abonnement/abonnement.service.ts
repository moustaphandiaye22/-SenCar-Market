import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { normalizeRequiredField } from '../../common/utils/field.util';
import { buildPaged, parsePaginationParams } from '../../common/utils/pagination-helper.util';

import {
  AbonnementRecord,
  BoostAnnonceRecord,
  UserRecord,
} from './abonnement.models';
import { ABONNEMENT_REPOSITORY_PORT, AbonnementRepositoryPort } from './abonnement.repository.port';
import { AbonnementResponseDto } from './dto/abonnement-response.dto';
import { BoostAnnonceResponseDto } from './dto/boost-annonce-response.dto';
import { CreateAbonnementRequestDto } from './dto/create-abonnement-request.dto';
import { CreateBoostRequestDto } from './dto/create-boost-request.dto';
import { SouscriptionRequestDto } from './dto/souscription-request.dto';
import { UtilisateurAbonnementResponseDto } from './dto/utilisateur-abonnement-response.dto';
import { AbonnementAccessPolicy } from './services/abonnement-access.policy';
import { AbonnementMapper } from './services/abonnement.mapper';
import { AbonnementInputValidator } from './validation/abonnement-input.validator';

@Injectable()
export class AbonnementService {
  constructor(
    @Inject(ABONNEMENT_REPOSITORY_PORT) private readonly repository: AbonnementRepositoryPort,
    private readonly inputValidator: AbonnementInputValidator,
    private readonly accessPolicy: AbonnementAccessPolicy,
    private readonly mapper: AbonnementMapper,
  ) {}

  async createPlan(
    request: CreateAbonnementRequestDto,
    user: AuthenticatedUser,
  ): Promise<AbonnementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertAdmin(currentUser.typeUtilisateur?.nom);

    const created = await this.repository.createAbonnement({
      id: this.repository.newId(),
      nom: request.nom,
      description: request.description,
      prixMensuel: request.prixMensuel,
      dureeJours: request.dureeJours,
      nombreAnnonces: request.nombreAnnonces,
      estVedette: request.estVedette ?? false,
      estCertifie: request.estCertifie ?? false,
      type: request.type,
      estActif: true,
    });

    return this.mapper.toAbonnementResponse(created);
  }

  async updatePlan(
    id: string,
    request: CreateAbonnementRequestDto,
    user: AuthenticatedUser,
  ): Promise<AbonnementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertAdmin(currentUser.typeUtilisateur?.nom);

    await this.mustFindAbonnement(id);

    const updated = await this.repository.updateAbonnement(id, {
      nom: request.nom,
      description: request.description,
      prixMensuel: request.prixMensuel,
      dureeJours: request.dureeJours,
      nombreAnnonces: request.nombreAnnonces,
      estVedette: request.estVedette,
      estCertifie: request.estCertifie,
      type: request.type,
    });

    return this.mapper.toAbonnementResponse(updated);
  }

  async deletePlan(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertAdmin(currentUser.typeUtilisateur?.nom);
    await this.mustFindAbonnement(id);

    await this.repository.updateAbonnement(id, { estActif: false });
  }

  async getPlanById(id: string): Promise<AbonnementResponseDto> {
    return this.mapper.toAbonnementResponse(await this.mustFindAbonnement(id));
  }

  async getAllPlans(): Promise<AbonnementResponseDto[]> {
    const plans = await this.repository.findAllAbonnements();
    return plans.filter((item) => item.estActif === true).map((item) => this.mapper.toAbonnementResponse(item));
  }

  async subscribe(
    request: SouscriptionRequestDto,
    user: AuthenticatedUser,
  ): Promise<UtilisateurAbonnementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const utilisateurId = this.resolveTargetUtilisateurId(request.utilisateurId, currentUser);

    const plan = await this.mustFindAbonnement(request.abonnementId);
    if (plan.estActif !== true) {
      throw new DomainException('Abonnement inactif', 400, 'ABONNEMENT_INACTIF');
    }

    const existing = await this.repository.findActiveSubscription(utilisateurId, new Date());
    if (existing) {
      throw new DomainException('Un abonnement actif existe déjà', 400, 'SUBSCRIPTION_ALREADY_ACTIVE');
    }

    const dateDebut = new Date();
    const dateFin = new Date(dateDebut.getTime());
    dateFin.setDate(dateFin.getDate() + (plan.dureeJours ?? 0));

    const created = await this.repository.createUtilisateurAbonnement({
      id: this.repository.newId(),
      utilisateur: { connect: { id: utilisateurId } },
      abonnement: { connect: { id: plan.id } },
      dateDebut,
      dateFin,
      statut: 'ACTIF',
      nombreAnnoncesUtilisees: 0,
    });

    return this.mapper.toUtilisateurAbonnementResponse(created);
  }

  async renewSubscription(utilisateurId: string, user: AuthenticatedUser): Promise<UtilisateurAbonnementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const active = await this.repository.findActiveSubscription(utilisateurId, new Date());
    if (!active) {
      throw new DomainException('Aucun abonnement actif', 404, 'NO_ACTIVE_SUBSCRIPTION');
    }

    const plan = await this.mustFindAbonnement(active.abonnementId);
    const baseDate = active.dateFin ?? new Date();
    const newDateFin = new Date(baseDate.getTime());
    newDateFin.setDate(newDateFin.getDate() + (plan.dureeJours ?? 0));

    const updated = await this.repository.updateUtilisateurAbonnement(active.id, {
      dateFin: newDateFin,
      statut: 'ACTIF',
    });

    return this.mapper.toUtilisateurAbonnementResponse(updated);
  }

  async cancelSubscription(utilisateurId: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const active = await this.repository.findActiveSubscription(utilisateurId, new Date());
    if (!active) {
      throw new DomainException('Aucun abonnement actif', 404, 'NO_ACTIVE_SUBSCRIPTION');
    }

    await this.repository.updateUtilisateurAbonnement(active.id, {
      statut: 'ANNULE',
    });
  }

  async getActiveSubscription(
    utilisateurId: string,
    user: AuthenticatedUser,
  ): Promise<UtilisateurAbonnementResponseDto | null> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const active = await this.repository.findActiveSubscription(utilisateurId, new Date());
    if (!active) {
      return null;
    }

    return this.mapper.toUtilisateurAbonnementResponse(active);
  }

  async getSubscriptionsHistory(
    utilisateurId: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<UtilisateurAbonnementResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 10 });

    const { items, total } = await this.repository.findSubscriptionsByUtilisateurPaged(
      utilisateurId,
      safePage,
      safeSize,
    );

    return buildPaged(
      items.map((item) => this.mapper.toUtilisateurAbonnementResponse(item)),
      safePage,
      safeSize,
      total,
    );
  }

  async createBoost(request: CreateBoostRequestDto, user: AuthenticatedUser): Promise<BoostAnnonceResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertCanManageBoost(currentUser.typeUtilisateur?.nom);
    const [dateDebut, dateFin] = this.inputValidator.parseBoostDates(request.dateDebut, request.dateFin);
    const niveauBoost = normalizeRequiredField(request.niveauBoost, 'niveauBoost', 'ABONNEMENT_INVALID_FIELD');

    const created = await this.repository.createBoost({
      id: this.repository.newId(),
      annonceLocation: { connect: { id: request.annonceLocationId } },
      dateDebut,
      dateFin,
      niveauBoost,
    });

    return this.mapper.toBoostResponse(created);
  }

  async updateBoost(id: string, request: CreateBoostRequestDto, user: AuthenticatedUser): Promise<BoostAnnonceResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertCanManageBoost(currentUser.typeUtilisateur?.nom);
    const [dateDebut, dateFin] = this.inputValidator.parseBoostDates(request.dateDebut, request.dateFin);
    const niveauBoost = normalizeRequiredField(request.niveauBoost, 'niveauBoost', 'ABONNEMENT_INVALID_FIELD');

    await this.mustFindBoost(id);
    const updated = await this.repository.updateBoost(id, {
      dateDebut,
      dateFin,
      niveauBoost,
    });

    return this.mapper.toBoostResponse(updated);
  }

  async deleteBoost(id: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertCanManageBoost(currentUser.typeUtilisateur?.nom);
    await this.mustFindBoost(id);
    await this.repository.deleteBoost(id);
  }

  async getBoostById(id: string): Promise<BoostAnnonceResponseDto> {
    return this.mapper.toBoostResponse(await this.mustFindBoost(id));
  }

  async getBoostsByVehicule(vehiculeId: string): Promise<BoostAnnonceResponseDto[]> {
    // Alignement Spring: le controller expose /vehicules/{vehiculeId}/boosts
    // mais la recherche est faite par annonceLocationId.
    const boosts = await this.repository.findBoostsByAnnonceLocationId(vehiculeId, new Date());
    return boosts.map((item) => this.mapper.toBoostResponse(item));
  }

  async notifierExpirationsProches(): Promise<number> {
    const now = new Date();
    const in7Days = new Date(now.getTime());
    in7Days.setDate(in7Days.getDate() + 7);

    const expiringSoon = await this.repository.findExpiringSoon(now, in7Days);
    return expiringSoon.length;
  }

  async confirmerPaiement(
    utilisateurId: string,
    _paiementId: string,
    user: AuthenticatedUser,
  ): Promise<UtilisateurAbonnementResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    this.accessPolicy.assertOwnerOrAdmin(currentUser, utilisateurId);

    const pending = await this.repository.findPendingSubscription(utilisateurId);
    if (!pending) {
      throw new DomainException('Aucun abonnement en attente', 404, 'NO_PENDING_SUBSCRIPTION');
    }

    const plan = await this.mustFindAbonnement(pending.abonnementId);
    const newDateFin = new Date();
    newDateFin.setDate(newDateFin.getDate() + (plan.dureeJours ?? 0));

    const saved = await this.repository.updateUtilisateurAbonnement(pending.id, {
      statut: 'ACTIF',
      dateFin: newDateFin,
    });

    return this.mapper.toUtilisateurAbonnementResponse(saved);
  }

  private async mustFindCurrentUser(email: string): Promise<UserRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindAbonnement(id: string): Promise<AbonnementRecord> {
    const plan = await this.repository.findAbonnementById(id);
    if (!plan) {
      throw new DomainException('Abonnement non trouvé', 404, 'ABONNEMENT_NOT_FOUND');
    }
    return plan;
  }

  private async mustFindBoost(id: string): Promise<BoostAnnonceRecord> {
    const boost = await this.repository.findBoostById(id);
    if (!boost) {
      throw new DomainException('Boost non trouvé', 404, 'BOOST_NOT_FOUND');
    }
    return boost;
  }

  private resolveTargetUtilisateurId(requestedId: string | undefined, currentUser: UserRecord): string {
    if (!requestedId) {
      return currentUser.id;
    }
    try {
      this.accessPolicy.assertOwnerOrAdmin(currentUser, requestedId);
    } catch {
      return currentUser.id;
    }
    return requestedId;
  }
}
