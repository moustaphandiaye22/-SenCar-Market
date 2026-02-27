import { Module } from '@nestjs/common';

import { CertificationController } from './certification.controller';
import { CertificationRepository } from './certification.repository';
import { CERTIFICATION_REPOSITORY_PORT } from './certification.repository.port';
import { CertificationService } from './certification.service';
import { CertificationDocumentService } from './services/certification-document.service';
import { CertificationSecurityService } from './services/certification-security.service';
import { CertificationWorkflowService } from './services/certification-workflow.service';
import { CertificationMapper } from './services/certification.mapper';
import { CertificationStatusValidator } from './validation/certification-status.validator';

@Module({
  controllers: [CertificationController],
  providers: [
    CertificationService,
    CertificationRepository,
    CertificationSecurityService,
    CertificationWorkflowService,
    CertificationDocumentService,
    CertificationMapper,
    CertificationStatusValidator,
    {
      provide: CERTIFICATION_REPOSITORY_PORT,
      useExisting: CertificationRepository,
    },
  ],
  exports: [CertificationService],
})
export class CertificationModule {}
