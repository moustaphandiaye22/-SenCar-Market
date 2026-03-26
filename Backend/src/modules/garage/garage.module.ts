import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';

import { GarageController } from './garage.controller';
import { GarageRepository } from './garage.repository';
import { GARAGE_REPOSITORY_PORT } from './garage.repository.port';
import { GarageService } from './garage.service';
import { RendezVousController } from './rendez-vous.controller';
import { GarageAccessPolicy } from './services/garage-access.policy';
import { GarageMapper } from './services/garage.mapper';
import { RendezVousService } from './services/rendez-vous.service';
import { GarageInputValidator } from './validation/garage-input.validator';

@Module({
  imports: [NotificationModule, CloudinaryModule],
  controllers: [RendezVousController, GarageController],
  providers: [
    GarageService,
    GarageRepository,
    GarageInputValidator,
    GarageAccessPolicy,
    GarageMapper,
    RendezVousService,
    {
      provide: GARAGE_REPOSITORY_PORT,
      useExisting: GarageRepository,
    },
  ],
  exports: [GarageService],
})
export class GarageModule {}
