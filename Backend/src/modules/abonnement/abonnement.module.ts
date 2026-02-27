import { Module } from '@nestjs/common';

import { AbonnementController } from './abonnement.controller';
import { AbonnementRepository } from './abonnement.repository';
import { ABONNEMENT_REPOSITORY_PORT } from './abonnement.repository.port';
import { AbonnementService } from './abonnement.service';
import { AbonnementAccessPolicy } from './services/abonnement-access.policy';
import { AbonnementMapper } from './services/abonnement.mapper';
import { AbonnementInputValidator } from './validation/abonnement-input.validator';

@Module({
  controllers: [AbonnementController],
  providers: [
    AbonnementService,
    AbonnementRepository,
    AbonnementInputValidator,
    AbonnementAccessPolicy,
    AbonnementMapper,
    {
      provide: ABONNEMENT_REPOSITORY_PORT,
      useExisting: AbonnementRepository,
    },
  ],
  exports: [AbonnementService],
})
export class AbonnementModule {}
