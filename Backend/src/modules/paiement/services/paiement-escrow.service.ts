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
      portefeuille: { connect: { id: portefeuille.id } },
      montant,
      typeTransaction: 'ESCROW_DEPOSIT',
      statut: 'CONFIRMEE',
      description: `Blocage fonds escrow - ${reference ?? ''}`.trim(),
      referenceExterne: reference ?? undefined,
      dateTransaction: new Date(),
      createdAt: new Date(),
    });

    await this.repository.updatePortefeuille(portefeuille.id, {
      soldeBloque: toNumberOrZero(portefeuille.soldeBloque) + montant,
      updatedAt: new Date(),
    });
  }

  async libererFondsEscrow(utilisateurId: string, montant: number, reference: string | null): Promise<void> {
    const portefeuille = await this.walletService.getOrCreatePortefeuilleEntity(utilisateurId);

    await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille: { connect: { id: portefeuille.id } },
      montant,
      typeTransaction: 'ESCROW_RELEASE',
      statut: 'CONFIRMEE',
      description: `Libération fonds escrow - ${reference ?? ''}`.trim(),
      referenceExterne: reference ?? undefined,
      dateTransaction: new Date(),
      createdAt: new Date(),
    });

    await this.repository.updatePortefeuille(portefeuille.id, {
      soldeBloque: Math.max(0, toNumberOrZero(portefeuille.soldeBloque) - montant),
      updatedAt: new Date(),
    });
  }
}
