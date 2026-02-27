import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { requireNonBlank } from '../../../common/utils/text.util';
import { CreateConversationRequestDto } from '../dto/create-conversation-request.dto';
import { TYPE_CONVERSATION_VALUES } from '../types/messagerie.types';

@Injectable()
export class MessagerieInputValidator {
  validateConversationCreation(request: CreateConversationRequestDto, createurId: string): string | undefined {
    const titre = request.titre?.trim();
    const type = request.typeConversation;

    if (!TYPE_CONVERSATION_VALUES.includes(type)) {
      throw new DomainException('Type de conversation invalide', 400, 'CONVERSATION_TYPE_INVALID');
    }
    if (type === 'GROUP' && !titre) {
      throw new DomainException('Le titre est requis pour une conversation de groupe', 400, 'GROUP_TITLE_REQUIRED');
    }
    if (type === 'DIRECT' && !request.autreUtilisateurId) {
      throw new DomainException('autreUtilisateurId est requis pour une conversation directe', 400, 'DIRECT_TARGET_REQUIRED');
    }
    if (type === 'DIRECT' && request.autreUtilisateurId === createurId) {
      throw new DomainException('Impossible de créer une conversation directe avec soi-même', 400, 'DIRECT_SELF_NOT_ALLOWED');
    }

    return titre;
  }

  normalizeSearchTerm(query: string): string | null {
    const cleaned = query?.trim();
    return cleaned ? cleaned : null;
  }

  requireMessageContent(contenu: string): string {
    return requireNonBlank(contenu, 'Le contenu du message est requis', 'MESSAGE_CONTENT_REQUIRED');
  }
}
