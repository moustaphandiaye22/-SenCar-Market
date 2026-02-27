import { Module } from '@nestjs/common';

import { MessagerieController } from './messagerie.controller';
import { MessagerieRepository } from './messagerie.repository';
import { MESSAGERIE_REPOSITORY_PORT } from './messagerie.repository.port';
import { MessagerieService } from './messagerie.service';
import { MessagerieAccessService } from './services/messagerie-access.service';
import { MessagerieMapper } from './services/messagerie.mapper';
import { MessagerieInputValidator } from './validation/messagerie-input.validator';

@Module({
  controllers: [MessagerieController],
  providers: [
    MessagerieService,
    MessagerieRepository,
    MessagerieInputValidator,
    MessagerieAccessService,
    MessagerieMapper,
    {
      provide: MESSAGERIE_REPOSITORY_PORT,
      useExisting: MessagerieRepository,
    },
  ],
  exports: [MessagerieService],
})
export class MessagerieModule {}
