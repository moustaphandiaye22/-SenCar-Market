import { Module } from '@nestjs/common';

import { PaiementController } from './paiement.controller';
import { PaiementRepository } from './paiement.repository';
import { PAIEMENT_REPOSITORY_PORT } from './paiement.repository.port';
import { PaiementService } from './paiement.service';
import { PaiementEscrowService } from './services/paiement-escrow.service';
import { PaiementLogService } from './services/paiement-log.service';
import { PaiementWalletService } from './services/paiement-wallet.service';
import { PaiementWebhookService } from './services/paiement-webhook.service';
import { PaiementAmountValidator } from './validation/paiement-amount.validator';

@Module({
  controllers: [PaiementController],
  providers: [
    PaiementService,
    PaiementRepository,
    PaiementWebhookService,
    PaiementWalletService,
    PaiementEscrowService,
    PaiementLogService,
    PaiementAmountValidator,
    {
      provide: PAIEMENT_REPOSITORY_PORT,
      useExisting: PaiementRepository,
    },
  ],
  exports: [PaiementService],
})
export class PaiementModule {}
