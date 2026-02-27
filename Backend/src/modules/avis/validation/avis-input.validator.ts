import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { CreateAvisRequestDto } from '../dto/create-avis-request.dto';
import { TYPE_AVIS_VALUES } from '../types/avis.types';

@Injectable()
export class AvisInputValidator {
  validateCreateAvisRequest(request: CreateAvisRequestDto): void {
    if (!TYPE_AVIS_VALUES.includes(request.typeAvis)) {
      throw new DomainException('Type d\'avis invalide', 400, 'AVIS_TYPE_INVALID');
    }

    const cibleCount =
      Number(Boolean(request.cibleUtilisateurId)) +
      Number(Boolean(request.vehiculeId)) +
      Number(Boolean(request.garageId));

    if (cibleCount === 0) {
      throw new DomainException('Une cible est requise', 400, 'AVIS_TARGET_REQUIRED');
    }
    if (cibleCount > 1) {
      throw new DomainException('Une seule cible est autorisée', 400, 'AVIS_SINGLE_TARGET_REQUIRED');
    }
  }
}
