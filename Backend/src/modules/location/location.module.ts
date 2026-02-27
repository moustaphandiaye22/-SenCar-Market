import { Module } from '@nestjs/common';

import { LocationController } from './location.controller';
import { LocationRepository } from './location.repository';
import { LOCATION_REPOSITORY_PORT } from './location.repository.port';
import { LocationService } from './location.service';
import { LocationAccessPolicy } from './services/location-access.policy';
import { LocationMapper } from './services/location.mapper';
import { LocationInputValidator } from './validation/location-input.validator';

@Module({
  controllers: [LocationController],
  providers: [
    LocationService,
    LocationRepository,
    LocationInputValidator,
    LocationAccessPolicy,
    LocationMapper,
    {
      provide: LOCATION_REPOSITORY_PORT,
      useExisting: LocationRepository,
    },
  ],
  exports: [LocationService],
})
export class LocationModule {}
