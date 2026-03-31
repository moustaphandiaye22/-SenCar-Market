import { Inject, Injectable } from '@nestjs/common';

import { PAIEMENT_REPOSITORY_PORT, PaiementRepositoryPort } from '../paiement.repository.port';

@Injectable()
export class PaiementLogService {
  constructor(@Inject(PAIEMENT_REPOSITORY_PORT) private readonly repository: PaiementRepositoryPort) {}

  async createLogAction(paiementId: string | null, action: string, details: string): Promise<void> {
    await this.repository.createPaiementLog({
      id: this.repository.newId(),
      paiement_id: paiementId ?? undefined,
      action,
      details,
      date_action: new Date(),
    });
  }
}
