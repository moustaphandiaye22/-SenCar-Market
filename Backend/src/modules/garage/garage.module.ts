import { Module } from '@nestjs/common';

import { GarageController } from './garage.controller';
import { GarageRepository } from './garage.repository';
import { GARAGE_REPOSITORY_PORT } from './garage.repository.port';
import { GarageService } from './garage.service';
import { GarageAccessPolicy } from './services/garage-access.policy';
import { GarageMapper } from './services/garage.mapper';
import { GarageInputValidator } from './validation/garage-input.validator';

@Module({
  controllers: [GarageController],
  providers: [
    GarageService,
    GarageRepository,
    GarageInputValidator,
    GarageAccessPolicy,
    GarageMapper,
    {
      provide: GARAGE_REPOSITORY_PORT,
      useExisting: GarageRepository,
    },
  ],
  exports: [GarageService],
})
export class GarageModule {}
