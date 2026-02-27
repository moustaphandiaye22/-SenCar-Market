import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { ADMIN_REPOSITORY_PORT } from './admin.repository.port';
import { AdminService } from './admin.service';
import { AdminAccessPolicy } from './services/admin-access.policy';
import { AdminMapper } from './services/admin.mapper';
import { AdminInputValidator } from './validation/admin-input.validator';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    AdminInputValidator,
    AdminAccessPolicy,
    AdminMapper,
    {
      provide: ADMIN_REPOSITORY_PORT,
      useExisting: AdminRepository,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
