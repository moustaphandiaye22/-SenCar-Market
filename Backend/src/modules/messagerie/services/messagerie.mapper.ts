import { Injectable } from '@nestjs/common';

import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { ParticipantResponseDto } from '../dto/participant-response.dto';
import { ConversationRecord, MessageRecord, ParticipantRecord } from '../messagerie.models';

@Injectable()
export class MessagerieMapper {
  toParticipantResponse(item: ParticipantRecord): ParticipantResponseDto {
    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      utilisateurNom: `${item.utilisateur.prenom ?? ''} ${item.utilisateur.nom ?? ''}`.trim() || null,
      utilisateurPhotoUrl: item.utilisateur.photoProfilUrl,
      dateJoin: item.dateJoin,
      estAdmin: item.estAdmin,
      estMute: item.estMute,
      nombreNonLus: item.nombreNonLus,
    };
  }

  toMessageResponse(message: MessageRecord): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      utilisateurId: message.utilisateurId,
      utilisateurNom: `${message.utilisateur.prenom ?? ''} ${message.utilisateur.nom ?? ''}`.trim() || null,
      contenu: message.contenu,
      dateEnvoi: message.dateEnvoi,
      dateLecture: message.dateLecture,
      estLu: message.estLu,
      estEpingle: message.estEpingle,
      typeMessage: message.typeMessage,
    };
  }

  toConversationResponse(
    conversation: ConversationRecord,
    dernierMessage: MessageResponseDto | null,
    participants: ParticipantResponseDto[],
    nombreNonLus: number,
  ): ConversationResponseDto {
    return {
      id: conversation.id,
      titre: conversation.titre,
      avatarUrl: conversation.avatarUrl,
      typeConversation: conversation.typeConversation,
      annonceId: conversation.annonceId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      dernierMessage,
      participants,
      nombreNonLus,
    };
  }
}
