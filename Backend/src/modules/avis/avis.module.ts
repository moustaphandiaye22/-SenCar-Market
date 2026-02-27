import { Module } from '@nestjs/common';

import { AvisController } from './avis.controller';
import { AvisRepository } from './avis.repository';
import { AVIS_REPOSITORY_PORT } from './avis.repository.port';
import { AvisService } from './avis.service';
import { AvisMapper } from './services/avis.mapper';
import { AvisInputValidator } from './validation/avis-input.validator';

@Module({
  controllers: [AvisController],
  providers: [
    AvisService,
    AvisRepository,
    AvisInputValidator,
    AvisMapper,
    {
      provide: AVIS_REPOSITORY_PORT,
      useExisting: AvisRepository,
    },
  ],
  exports: [AvisService],
})
export class AvisModule {}
