import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { toNumberOrZero } from '../../../common/utils/number.util';
import type { RetraitRequestDto } from '../dto/retrait-request.dto';
import type { TransactionPortefeuilleRequestDto } from '../dto/transaction-portefeuille-request.dto';
import type { PortefeuilleRecord, TransactionRecord, UserRecord } from '../paiement.models';
import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';

import { PaiementLogService } from './paiement-log.service';

@Injectable()
export class PaiementWalletService {
  constructor(
    @Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort,
    private readonly paiementLogService: PaiementLogService,
  ) {}

  async getOrCreatePortefeuilleEntity(utilisateurId: string): Promise<PortefeuilleRecord> {
    const existing = await this.repository.findPortefeuilleByUtilisateurId(utilisateurId);
    if (existing) {
      return existing;
    }

    const user = await this.mustFindUser(utilisateurId);
    return this.repository.createPortefeuille({
      id: this.repository.newId(),
      utilisateur: { connect: { id: user.id } },
      solde: 0,
      soldeBloque: 0,
      isActif: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async crediterPortefeuille(request: TransactionPortefeuilleRequestDto, utilisateurId: string): Promise<PortefeuilleRecord> {
    const portefeuille = await this.getOrCreatePortefeuilleEntity(utilisateurId);

    await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille: { connect: { id: portefeuille.id } },
      montant: request.montant,
      typeTransaction: 'CREDIT',
      statut: 'CONFIRMEE',
      description: request.description,
      referenceExterne: request.referencePaiement,
      dateTransaction: new Date(),
      createdAt: new Date(),
    });

    const updated = await this.repository.updatePortefeuille(portefeuille.id, {
      solde: toNumberOrZero(portefeuille.solde) + request.montant,
      dateDerniereRecharge: new Date(),
      updatedAt: new Date(),
    });

    await this.paiementLogService.createLogAction(
      null,
      'CREDIT',
      `Crédit de ${request.montant} - ${request.description ?? ''}`.trim(),
    );
    return updated;
  }

  async debiterPortefeuille(request: TransactionPortefeuilleRequestDto, utilisateurId: string): Promise<PortefeuilleRecord> {
    const portefeuille = await this.getOrCreatePortefeuilleEntity(utilisateurId);

    if (this.availableBalance(portefeuille) < request.montant) {
      throw new DomainException('Solde insuffisant', 400, 'WALLET_INSUFFICIENT_BALANCE_OPERATION');
    }

    await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille: { connect: { id: portefeuille.id } },
      montant: request.montant,
      typeTransaction: 'DEBIT',
      statut: 'CONFIRMEE',
      description: request.description,
      referenceExterne: request.referencePaiement,
      dateTransaction: new Date(),
      createdAt: new Date(),
    });

    const updated = await this.repository.updatePortefeuille(portefeuille.id, {
      solde: toNumberOrZero(portefeuille.solde) - request.montant,
      updatedAt: new Date(),
    });

    await this.paiementLogService.createLogAction(
      null,
      'DEBIT',
      `Débit de ${request.montant} - ${request.description ?? ''}`.trim(),
    );
    return updated;
  }

  async demanderRetrait(request: RetraitRequestDto, utilisateurId: string): Promise<TransactionRecord> {
    const portefeuille = await this.getOrCreatePortefeuilleEntity(utilisateurId);

    if (this.availableBalance(portefeuille) < request.montant) {
      throw new DomainException('Solde insuffisant pour retrait', 400, 'WALLET_INSUFFICIENT_BALANCE_WITHDRAW');
    }

    const created = await this.repository.createTransaction({
      id: this.repository.newId(),
      portefeuille: { connect: { id: portefeuille.id } },
      montant: request.montant,
      typeTransaction: 'RETRAIT',
      statut: 'EN_ATTENTE',
      description: `Retrait vers ${request.telephone} - ${request.nomBeneficiaire ?? ''}`.trim(),
      dateTransaction: new Date(),
      createdAt: new Date(),
    });

    await this.repository.updatePortefeuille(portefeuille.id, {
      soldeBloque: toNumberOrZero(portefeuille.soldeBloque) + request.montant,
      updatedAt: new Date(),
    });

    return created;
  }

  hasSufficientAvailableBalance(portefeuille: PortefeuilleRecord, montant: number): boolean {
    return this.availableBalance(portefeuille) >= montant;
  }

  private availableBalance(portefeuille: PortefeuilleRecord): number {
    return toNumberOrZero(portefeuille.solde) - toNumberOrZero(portefeuille.soldeBloque);
  }

  private async mustFindUser(id: string): Promise<UserRecord> {
    const user = await this.repository.findUserById(id);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

}
