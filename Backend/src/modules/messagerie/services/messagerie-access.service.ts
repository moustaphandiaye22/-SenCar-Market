import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { MessagerieRepositoryPort } from '../messagerie.repository.port';

@Injectable()
export class MessagerieAccessService {
  async ensureParticipant(
    repository: MessagerieRepositoryPort,
    conversationId: string,
    utilisateurId: string,
  ): Promise<void> {
    if (!(await repository.existsParticipant(conversationId, utilisateurId))) {
      throw new DomainException('Vous ne participez pas à cette conversation', 403, 'NOT_PARTICIPANT');
    }
  }

  async ensureConversationAdmin(
    repository: MessagerieRepositoryPort,
    conversationId: string,
    utilisateurId: string,
  ): Promise<void> {
    const participant = await repository.findParticipant(conversationId, utilisateurId);
    if (!participant) {
      throw new DomainException('Vous ne participez pas à cette conversation', 403, 'NOT_PARTICIPANT');
    }

    if (!participant.estAdmin) {
      throw new DomainException('Droits admin requis', 403, 'MESSAGERIE_ADMIN_REQUIRED');
    }
  }
}
