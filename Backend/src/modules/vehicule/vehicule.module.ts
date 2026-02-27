import { Module } from '@nestjs/common';

import { VehiculeAccessPolicy } from './services/vehicule-access.policy';
import { VehiculeMapper } from './services/vehicule.mapper';
import { VehiculeInputValidator } from './validation/vehicule-input.validator';
import { VehiculeController } from './vehicule.controller';
import { VehiculeRepository } from './vehicule.repository';
import { VEHICULE_REPOSITORY_PORT } from './vehicule.repository.port';
import { VehiculeService } from './vehicule.service';

@Module({
  controllers: [VehiculeController],
  providers: [
    VehiculeService,
    VehiculeRepository,
    VehiculeInputValidator,
    VehiculeAccessPolicy,
    VehiculeMapper,
    {
      provide: VEHICULE_REPOSITORY_PORT,
      useExisting: VehiculeRepository,
    },
  ],
  exports: [VehiculeService],
})
export class VehiculeModule {}
