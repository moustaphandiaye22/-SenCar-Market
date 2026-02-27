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

  // Private helpers

  private async ensureAdmin(user: AuthenticatedUser): Promise<void> {
    const current = await this.repository.findUserByEmail(user.email);
    this.accessPolicy.assertAdmin(current);
  }
}
