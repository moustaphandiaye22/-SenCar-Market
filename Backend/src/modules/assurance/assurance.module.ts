import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

import { AssuranceController } from './assurance.controller';
import { AssuranceRepository } from './assurance.repository';
import { ASSURANCE_REPOSITORY_PORT } from './assurance.repository.port';
import { AssuranceService } from './assurance.service';
import { AssuranceAccessPolicy } from './services/assurance-access.policy';
import { AssurancePricingService } from './services/assurance-pricing.service';
import { AssuranceMapper } from './services/assurance.mapper';
import { AssuranceOptionIdsValidator } from './validation/assurance-option-ids.validator';

@Module({
  imports: [CloudinaryModule],
  controllers: [AssuranceController],
  providers: [
    AssuranceService,
    AssuranceRepository,
    AssuranceOptionIdsValidator,
    AssuranceAccessPolicy,
    AssurancePricingService,
    AssuranceMapper,
    {
      provide: ASSURANCE_REPOSITORY_PORT,
      useExisting: AssuranceRepository,
    },
  ],
  exports: [AssuranceService],
})
export class AssuranceModule {}
