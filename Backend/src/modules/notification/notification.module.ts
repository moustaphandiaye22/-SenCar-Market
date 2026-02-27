import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { NOTIFICATION_REPOSITORY_PORT } from './notification.repository.port';
import { NotificationService } from './notification.service';
import { NotificationAccessPolicy } from './services/notification-access.policy';
import { NotificationMapper } from './services/notification.mapper';
import { SignalementController } from './signalement.controller';
import { NotificationInputValidator } from './validation/notification-input.validator';

@Module({
  controllers: [NotificationController, SignalementController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationInputValidator,
    NotificationAccessPolicy,
    NotificationMapper,
    {
      provide: NOTIFICATION_REPOSITORY_PORT,
      useExisting: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
