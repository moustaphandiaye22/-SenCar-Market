import { Injectable } from '@nestjs/common';

import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { ParticipantResponseDto } from '../dto/participant-response.dto';
import { ConversationRecord, MessageRecord, ParticipantRecord } from '../messagerie.models';
import type { TypeMessage } from '../types/messagerie.types';

@Injectable()
export class MessagerieMapper {
  toParticipantResponse(item: ParticipantRecord): ParticipantResponseDto {
    return {
      id: item.id,
      utilisateurId: item.utilisateur_id,
      utilisateurNom: `${item.utilisateur.prenom ?? ''} ${item.utilisateur.nom ?? ''}`.trim() || null,
      utilisateurPhotoUrl: item.utilisateur.photo_profil_url ?? null,
      dateJoin: item.date_join ?? null,
      estAdmin: item.est_admin ?? false,
      estMute: item.est_mute ?? false,
      nombreNonLus: item.nombre_non_lus ?? 0,
    };
  }

  toMessageResponse(message: MessageRecord): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversation_id,
      utilisateurId: message.utilisateur_id,
      utilisateurNom: `${message.utilisateur.prenom ?? ''} ${message.utilisateur.nom ?? ''}`.trim() || null,
      contenu: message.contenu,
      dateEnvoi: message.date_envoi ?? null,
      dateLecture: message.date_lecture ?? null,
      estLu: message.est_lu ?? false,
      estEpingle: message.est_epingle ?? false,
      typeMessage: (message.type_message as TypeMessage | null) ?? 'TEXTE',
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
      titre: conversation.titre ?? null,
      avatarUrl: conversation.avatar_url ?? null,
      typeConversation: conversation.type_conversation ?? 'DIRECT',
      annonceId: conversation.annonce_id ?? null,
      createdAt: conversation.created_at ?? null,
      updatedAt: conversation.updated_at ?? null,
      dernierMessage,
      participants,
      nombreNonLus,
    };
  }
}
