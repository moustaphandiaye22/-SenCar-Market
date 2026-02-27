import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { toNumberOrZero } from '../../common/utils/number.util';
import { buildPaged, parsePaginationParams } from '../../common/utils/pagination-helper.util';
import { UtilisateurResponseDto } from '../auth/dto/utilisateur-response.dto';
import { TransactionResponseDto } from '../paiement/dto/transaction-response.dto';
import { VehiculeResponseDto } from '../vehicule/dto/vehicule-response.dto';

import { AdminUserRecord } from './admin.models';
import { ADMIN_REPOSITORY_PORT, AdminRepositoryPort } from './admin.repository.port';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';
import { ModifierRoleRequestDto } from './dto/modifier-role-request.dto';
import { AdminAccessPolicy } from './services/admin-access.policy';
import { AdminMapper } from './services/admin.mapper';
import { AdminInputValidator } from './validation/admin-input.validator';


@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT) private readonly repository: AdminRepositoryPort,
    private readonly inputValidator: AdminInputValidator,
    private readonly accessPolicy: AdminAccessPolicy,
    private readonly mapper: AdminMapper,
  ) {}

  async getDashboardStats(user: AuthenticatedUser): Promise<DashboardStatsResponseDto> {
    await this.ensureAdmin(user);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUtilisateurs,
      totalAnnonces,
      totalAnnoncesActives,
      totalReservations,
      reservationsEnAttente,
      totalPaiements,
      paiementsEnAttente,
      totalAbonnements,
      abonnementsActifs,
      transactionsConfirmees,
    ] = await Promise.all([
      this.repository.countUtilisateurs(),
      this.repository.countVehicules(),
      this.repository.countVehiculesByStatut('PUBLIE'),
      this.repository.countReservations(),
      this.repository.countReservationsByStatut('EN_ATTENTE'),
      this.repository.countTransactions(),
      this.repository.countTransactionsByStatut('EN_ATTENTE'),
      this.repository.countAbonnements(),
      this.repository.countAbonnementsActifs(now),
      this.repository.findTransactionsByStatut('CONFIRMEE'),
    ]);

    const revenusTotaux = transactionsConfirmees.reduce((sum, t) => sum + toNumberOrZero(t.montant), 0);
    const revenusCeMois = transactionsConfirmees.reduce((sum, t) => {
      if (t.dateTransaction && t.dateTransaction >= monthStart) {
        return sum + toNumberOrZero(t.montant);
      }
      return sum;
    }, 0);

    return {
      totalUtilisateurs,
      totalAnnonces,
      totalAnnoncesActives,
      totalReservations,
      reservationsEnAttente,
      revenusTotaux,
      revenusCeMois,
      totalPaiements,
      paiementsEnAttente,
      totalAbonnements,
      abonnementsActifs,
    };
  }

  async getAllUtilisateurs(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<UtilisateurResponseDto>> {
    await this.ensureAdmin(user);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size);
    const parsedSortDir = this.inputValidator.parseSortDir(sortDir);

    const { items, total } = await this.repository.findUsersPaged(safePage, safeSize, sortBy, parsedSortDir);
    return buildPaged(
      items.map((u: AdminUserRecord) => this.mapper.toUtilisateurResponse(u)),
      safePage,
      safeSize,
      total,
    );
  }

  async getUtilisateurById(utilisateurId: string, user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    return this.mapper.toUtilisateurResponse(found);
  }

  async suspendreUtilisateur(utilisateurId: string, raison: string, user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);
    const raisonNettoyee = this.inputValidator.requireReason(raison);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const saved = await this.repository.updateUser(utilisateurId, { deletedAt: new Date() });
    await this.notifyUtilisateur(utilisateurId, 'SUSPENSION', `Votre compte a été suspendu. Raison: ${raisonNettoyee}`);
    return this.mapper.toUtilisateurResponse(saved);
  }

  async reactiverUtilisateur(utilisateurId: string, user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const saved = await this.repository.updateUser(utilisateurId, { deletedAt: null });
    await this.notifyUtilisateur(utilisateurId, 'REACTIVATION', 'Votre compte a été réactivé.');
    return this.mapper.toUtilisateurResponse(saved);
  }

  async bannirUtilisateur(utilisateurId: string, raison: string, user: AuthenticatedUser): Promise<void> {
    await this.ensureAdmin(user);
    const raisonNettoyee = this.inputValidator.requireReason(raison);
    const found = await this.repository.findUserById(utilisateurId);
    if (!found) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');

    const bannedUntil = new Date();
    bannedUntil.setFullYear(bannedUntil.getFullYear() + 100);
    await this.repository.updateUser(utilisateurId, { deletedAt: bannedUntil });
    await this.notifyUtilisateur(utilisateurId, 'BAN', `Votre compte a été banni. Raison: ${raisonNettoyee}`);
  }

  async modifierRole(
    utilisateurId: string,
    request: ModifierRoleRequestDto,
    user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    await this.ensureAdmin(user);

    const [target, role] = await Promise.all([
      this.repository.findUserById(utilisateurId),
      this.repository.findTypeUtilisateurByNom(request.nouveauRole),
    ]);

    if (!target) throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    if (!role) throw new DomainException('Rôle invalide', 400, 'ROLE_INVALID');

    const saved = await this.repository.updateUser(utilisateurId, { typeUtilisateurId: role.id });
    await this.notifyUtilisateur(
      utilisateurId,
      'MODIFICATION_ROLE',
      `Votre rôle a été modifié vers ${request.nouveauRole}`,
    );
    return this.mapper.toUtilisateurResponse(saved);
  }

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

  async validerAnnonce(annonceId: string, user: AuthenticatedUser): Promise<VehiculeResponseDto> {
    await this.ensureAdmin(user);
    const found = await this.repository.findVehiculeById(annonceId);
    if (!found) throw new DomainException('Annonce non trouvée', 404, 'ANNONCE_NOT_FOUND');

    const saved = await this.repository.updateVehicule(annonceId, { statut: 'PUBLIE' });
    return this.mapper.toVehiculeResponse(saved);
  }

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

  async supprimerAnnonce(annonceId: string, user: AuthenticatedUser): Promise<void> {
    await this.ensureAdmin(user);
    const found = await this.repository.findVehiculeById(annonceId);
    if (!found) throw new DomainException('Annonce non trouvée', 404, 'ANNONCE_NOT_FOUND');

    await this.notifyUtilisateur(found.proprietaireId, 'ANNONCE_SUPPRIMEE', 'Votre annonce a été supprimée par l\'administrateur.');
    await this.repository.deleteVehicule(annonceId);
  }

  async getAllTransactions(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    await this.ensureAdmin(user);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size);
    const parsedSortDir = this.inputValidator.parseSortDir(sortDir);

    const { items, total } = await this.repository.findTransactionsPaged(safePage, safeSize, sortBy, parsedSortDir);
    return buildPaged(
      items.map((t) => this.mapper.toTransactionResponse(t)),
      safePage,
      safeSize,
      total,
    );
  }

  async getTransactionsByUtilisateur(
    utilisateurId: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    await this.ensureAdmin(user);
    const txs = await this.repository.findTransactionsByUtilisateurId(utilisateurId);

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size);
    const start = safePage * safeSize;
    const end = Math.min(start + safeSize, txs.length);
    const slice = start < txs.length ? txs.slice(start, end) : [];

    return buildPaged(
      slice.map((t) => this.mapper.toTransactionResponse(t)),
      safePage,
      safeSize,
      txs.length,
    );
  }

  async getTotalCommissions(user: AuthenticatedUser): Promise<number> {
    await this.ensureAdmin(user);
    const confirmed = await this.repository.findTransactionsByStatut('CONFIRMEE');
    return confirmed.reduce((sum, t) => sum + toNumberOrZero(t.montant) * 0.05, 0);
  }

  async effectuerRemboursement(
    transactionId: string,
    raison: string,
    user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    await this.ensureAdmin(user);
    const raisonNettoyee = this.inputValidator.requireReason(raison);
    const tx = await this.repository.findTransactionById(transactionId);
    if (!tx) throw new DomainException('Transaction non trouvée', 404, 'TRANSACTION_NOT_FOUND');

    if (tx.statut !== 'CONFIRMEE') {
      throw new DomainException('Remboursement possible uniquement pour une transaction confirmée', 400, 'REFUND_ONLY_CONFIRMED');
    }

    const montant = -Math.abs(toNumberOrZero(tx.montant));
    const saved = await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille: { connect: { id: tx.portefeuilleId } },
      montant,
      typeTransaction: tx.typeTransaction,
      statut: 'CONFIRMEE',
      description: `Remboursement pour transaction ${transactionId}. Raison: ${raisonNettoyee}`,
      dateTransaction: new Date(),
      createdAt: new Date(),
    });

    if (tx.portefeuille?.utilisateurId) {
      await this.notifyUtilisateur(tx.portefeuille.utilisateurId, 'PAIEMENT', `Votre remboursement de ${Math.abs(montant)} a été traité.`);
    }

    return this.mapper.toTransactionResponse(saved);
  }

  async notifierTousUtilisateurs(titre: string, message: string, user: AuthenticatedUser): Promise<void> {
    await this.ensureAdmin(user);
    const titreNettoye = this.inputValidator.requireTitle(titre);
    const messageNettoye = this.inputValidator.requireMessage(message);
    const users = await this.repository.findAllUsersIds();
    await Promise.all(users.map((u) => this.notifyUtilisateur(u.id, titreNettoye, messageNettoye)));
  }

  async notifierGroupeUtilisateurs(
    utilisateurIds: string[] | string,
    titre: string,
    message: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.ensureAdmin(user);
    const titreNettoye = this.inputValidator.requireTitle(titre);
    const messageNettoye = this.inputValidator.requireMessage(message);
    const ids = this.inputValidator.normalizeUtilisateurIds(utilisateurIds);
    await Promise.all(ids.map((id) => this.notifyUtilisateur(id, titreNettoye, messageNettoye)));
  }

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

  private buildPaged<T>(content: T[], page: number, size: number, total: number): PaginatedResponseDto<T> {
    return buildPaged(content, page, size, total);
  }
}
