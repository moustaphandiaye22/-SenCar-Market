import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { toNumberOrZero } from '../../../common/utils/number.util';
import { buildPaged, parsePaginationParams } from '../../../common/utils/pagination-helper.util';
import { TransactionResponseDto } from '../../paiement/dto/transaction-response.dto';
import { ADMIN_REPOSITORY_PORT, AdminRepositoryPort } from '../admin.repository.port';
import { AdminInputValidator } from '../validation/admin-input.validator';

import { AdminAccessPolicy } from './admin-access.policy';
import { AdminMapper } from './admin.mapper';


/**
 * Admin Transaction Service - Single Responsibility for transaction management
 * Handles transaction listing, refunds, and commission calculations
 */
@Injectable()
export class AdminTransactionService {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT) private readonly repository: AdminRepositoryPort,
    private readonly inputValidator: AdminInputValidator,
    private readonly accessPolicy: AdminAccessPolicy,
    private readonly mapper: AdminMapper,
  ) {}

  /**
   * Get all transactions with pagination
   */
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

  /**
   * Get transactions for a specific user
   */
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

  /**
   * Get total commissions from confirmed transactions
   */
  async getTotalCommissions(user: AuthenticatedUser): Promise<number> {
    await this.ensureAdmin(user);
    const confirmed = await this.repository.findTransactionsByStatut('CONFIRMEE');
    return confirmed.reduce((sum, t) => sum + toNumberOrZero(t.montant) * 0.05, 0);
  }

  /**
   * Process a refund for a transaction
   */
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
