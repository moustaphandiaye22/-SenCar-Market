import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { toNumberOrZero } from '../../../common/utils/number.util';
import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';

import { PaiementWalletService } from './paiement-wallet.service';

@Injectable()
export class PaiementEscrowService {
  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly walletService: PaiementWalletService,
  ) {}

  async bloquerFondsEscrow(utilisateurId: string, montant: number, reference: string | null): Promise<void> {
    const portefeuille = await this.walletService.getOrCreatePortefeuilleEntity(utilisateurId);
    if (!this.walletService.hasSufficientAvailableBalance(portefeuille, montant)) {
      throw new DomainException('Solde insuffisant pour escrow', 400, 'WALLET_INSUFFICIENT_BALANCE_ESCROW');
    }

    await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille_id: portefeuille.id,
      montant,
      type_transaction: 'ESCROW_DEPOSIT',
      statut: 'CONFIRMEE',
      description: `Blocage fonds escrow - ${reference ?? ''}`.trim(),
      reference_externe: reference ?? undefined,
      date_transaction: new Date(),
    } as any);

    await this.repository.updatePortefeuille(portefeuille.id, {
      solde_bloque: toNumberOrZero(portefeuille.solde_bloque) + montant,
      updated_at: new Date(),
    } as any);
  }

  async libererFondsEscrow(utilisateurId: string, montant: number, reference: string | null): Promise<void> {
    const portefeuille = await this.walletService.getOrCreatePortefeuilleEntity(utilisateurId);

    await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille_id: portefeuille.id,
      montant,
      type_transaction: 'ESCROW_RELEASE',
      statut: 'CONFIRMEE',
      description: `Libération fonds escrow - ${reference ?? ''}`.trim(),
      reference_externe: reference ?? undefined,
      date_transaction: new Date(),
    } as any);

    await this.repository.updatePortefeuille(portefeuille.id, {
      solde_bloque: Math.max(0, toNumberOrZero(portefeuille.solde_bloque) - montant),
      updated_at: new Date(),
    } as any);
  }
}
