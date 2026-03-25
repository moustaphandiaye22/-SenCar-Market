import { Inject, Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { toNumberOrZero } from '../../../common/utils/number.util';
import { ADMIN_REPOSITORY_PORT, AdminRepositoryPort } from '../admin.repository.port';
import { DashboardStatsResponseDto } from '../dto/dashboard-stats-response.dto';

import { AdminAccessPolicy } from './admin-access.policy';

/**
 * Admin Dashboard Service - Single Responsibility for dashboard statistics
 * Handles all dashboard metrics and statistics
 */
@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT) private readonly repository: AdminRepositoryPort,
    private readonly accessPolicy: AdminAccessPolicy,
  ) {}

  /**
   * Get dashboard statistics
   * Returns comprehensive metrics for the admin dashboard
   */
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
      reprisesEnAttente,
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
      this.repository.countTradeInByStatut(['EN_ATTENTE', 'EN_COURS_EVALUATION']),
    ]);

    const revenusTotaux = transactionsConfirmees.reduce((sum, t) => sum + toNumberOrZero(t.montant), 0);
    const revenusCeMois = transactionsConfirmees.reduce((sum, t) => {
      if (t.dateTransaction && t.dateTransaction >= monthStart) {
        return sum + toNumberOrZero(t.montant);
      }
      return sum;
    }, 0);

    // Calculate revenue for the last 7 months (6 months ago + current month)
    const revenusMensuels = Array(7).fill(0);
    transactionsConfirmees.forEach(t => {
      if (!t.dateTransaction) return;
      const tDate = new Date(t.dateTransaction);
      const monthsDiff = (now.getFullYear() - tDate.getFullYear()) * 12 + now.getMonth() - tDate.getMonth();
      if (monthsDiff >= 0 && monthsDiff < 7) {
        revenusMensuels[6 - monthsDiff] += toNumberOrZero(t.montant);
      }
    });

    return {
      totalUtilisateurs,
      totalAnnonces,
      totalAnnoncesActives,
      totalReservations,
      reservationsEnAttente,
      revenusTotaux,
      revenusCeMois,
      revenusMensuels,
      totalTransactions: totalPaiements,
      totalPaiements,
      paiementsEnAttente,
      reprisesEnAttente,
      totalAbonnements,
      abonnementsActifs,
    };
  }

  // Private helpers

  private async ensureAdmin(user: AuthenticatedUser): Promise<void> {
    const current = await this.repository.findUserByEmail(user.email);
    this.accessPolicy.assertAdmin(current);
  }
}
