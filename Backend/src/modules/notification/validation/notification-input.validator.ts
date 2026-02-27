import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import {
  STATUT_TRAITEMENT_SIGNALEMENT_VALUES,
  StatutTraitementSignalement,
  TYPE_ENTITE_SIGNALABLE_VALUES,
  TYPE_NOTIFICATION_VALUES,
  TypeNotification,
} from '../types/notification.types';

@Injectable()
export class NotificationInputValidator {
  parseNotificationType(raw: string): TypeNotification {
    const normalized = raw.toUpperCase().trim();
    if (!TYPE_NOTIFICATION_VALUES.includes(normalized as TypeNotification)) {
      throw new DomainException('Type de notification invalide', 400, 'NOTIFICATION_TYPE_INVALID');
    }
    return normalized as TypeNotification;
  }

  parseSignalementStatut(raw: string): StatutTraitementSignalement {
    const normalized = raw.toUpperCase().trim();
    if (!STATUT_TRAITEMENT_SIGNALEMENT_VALUES.includes(normalized as StatutTraitementSignalement)) {
      throw new DomainException('Statut de signalement invalide', 400, 'SIGNALEMENT_STATUS_INVALID');
    }
    return normalized as StatutTraitementSignalement;
  }

  parseSignalementType(raw: string): (typeof TYPE_ENTITE_SIGNALABLE_VALUES)[number] {
    const normalized = raw.toUpperCase().trim();
    if (!TYPE_ENTITE_SIGNALABLE_VALUES.includes(normalized as (typeof TYPE_ENTITE_SIGNALABLE_VALUES)[number])) {
      throw new DomainException('Type d\'entité signalable invalide', 400, 'SIGNALEMENT_TYPE_INVALID');
    }
    return normalized as (typeof TYPE_ENTITE_SIGNALABLE_VALUES)[number];
  }

  parseSortDir(raw: string): 'asc' | 'desc' {
    return raw.toLowerCase() === 'asc' ? 'asc' : 'desc';
  }
}
