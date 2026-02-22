package com.sencarmarket.module.messagerie.mapper;

import com.sencarmarket.module.messagerie.dto.ConversationResponse;
import com.sencarmarket.module.messagerie.dto.MessageResponse;
import com.sencarmarket.module.messagerie.dto.ParticipantResponse;
import com.sencarmarket.module.messagerie.entity.Conversation;
import com.sencarmarket.module.messagerie.entity.Message;
import com.sencarmarket.module.messagerie.entity.ConversationParticipant;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités et DTOs du module Messagerie
 * Suit le principe DRY en centralisant les conversions
 */
@Component
public class MessagerieMapper {

    /**
     * Convertit une entité Conversation en ConversationResponse
     */
    public ConversationResponse toConversationResponse(Conversation conversation) {
        if (conversation == null) {
            return null;
        }
        return ConversationResponse.fromEntity(conversation);
    }

    /**
     * Convertit une liste d'entités Conversation en liste de ConversationResponse
     */
    public List<ConversationResponse> toConversationResponseList(List<Conversation> conversations) {
        if (conversations == null) {
            return null;
        }
        return conversations.stream()
                .map(this::toConversationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité Message en MessageResponse
     */
    public MessageResponse toMessageResponse(Message message) {
        if (message == null) {
            return null;
        }
        return MessageResponse.fromEntity(message);
    }

    /**
     * Convertit une liste d'entités Message en liste de MessageResponse
     */
    public List<MessageResponse> toMessageResponseList(List<Message> messages) {
        if (messages == null) {
            return null;
        }
        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité ConversationParticipant en ParticipantResponse
     */
    public ParticipantResponse toParticipantResponse(ConversationParticipant participant) {
        if (participant == null) {
            return null;
        }
        return ParticipantResponse.fromEntity(participant);
    }

    /**
     * Convertit une liste d'entités ConversationParticipant en liste de ParticipantResponse
     */
    public List<ParticipantResponse> toParticipantResponseList(List<ConversationParticipant> participants) {
        if (participants == null) {
            return null;
        }
        return participants.stream()
                .map(this::toParticipantResponse)
                .collect(Collectors.toList());
    }
}
