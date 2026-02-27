import { Module } from '@nestjs/common';

import { TradeInEstimationService } from './services/tradein-estimation.service';
import { TradeInSecurityService } from './services/tradein-security.service';
import { TradeInWorkflowService } from './services/tradein-workflow.service';
import { TradeInMapper } from './services/tradein.mapper';
import { TradeInController } from './tradein.controller';
import { TradeInRepository } from './tradein.repository';
import { TRADEIN_REPOSITORY_PORT } from './tradein.repository.port';
import { TradeInService } from './tradein.service';
import { TradeInStatusValidator } from './validation/tradein-status.validator';

@Module({
  controllers: [TradeInController],
  providers: [
    TradeInService,
    TradeInRepository,
    TradeInSecurityService,
    TradeInWorkflowService,
    TradeInEstimationService,
    TradeInMapper,
    TradeInStatusValidator,
    {
      provide: TRADEIN_REPOSITORY_PORT,
      useExisting: TradeInRepository,
    },
  ],
  exports: [TradeInService],
})
export class TradeInModule {}
