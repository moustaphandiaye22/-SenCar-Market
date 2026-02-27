import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { requireNonBlank } from '../../../common/utils/text.util';

@Injectable()
export class AdminInputValidator {
  parseSortDir(sortDir: string): 'asc' | 'desc' {
    return sortDir.toLowerCase() === 'asc' ? 'asc' : 'desc';
  }

  requireReason(raison: string): string {
    return requireNonBlank(raison, 'Raison requise', 'ADMIN_REASON_REQUIRED');
  }

  requireTitle(titre: string): string {
    return requireNonBlank(titre, 'Titre requis', 'ADMIN_NOTIFICATION_TITLE_REQUIRED');
  }

  requireMessage(message: string): string {
    return requireNonBlank(message, 'Message requis', 'ADMIN_NOTIFICATION_MESSAGE_REQUIRED');
  }

  normalizeUtilisateurIds(input: string[] | string): string[] {
    const raw = Array.isArray(input) ? input : [input];
    const ids = raw
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (ids.length === 0) {
      throw new DomainException('Au moins un utilisateur est requis', 400, 'ADMIN_USERS_REQUIRED');
    }

    const uuidV4Like = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalid = ids.find((id) => !uuidV4Like.test(id));
    if (invalid) {
      throw new DomainException('Identifiant utilisateur invalide', 400, 'ADMIN_USER_ID_INVALID');
    }

    return Array.from(new Set(ids));
  }
}
