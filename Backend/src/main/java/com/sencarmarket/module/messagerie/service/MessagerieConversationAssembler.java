package com.sencarmarket.module.messagerie.service;

import com.sencarmarket.module.messagerie.dto.ConversationResponse;
import com.sencarmarket.module.messagerie.dto.MessageResponse;
import com.sencarmarket.module.messagerie.dto.ParticipantResponse;
import com.sencarmarket.module.messagerie.entity.Conversation;
import com.sencarmarket.module.messagerie.entity.Message;
import com.sencarmarket.module.messagerie.repository.ConversationParticipantRepository;
import com.sencarmarket.module.messagerie.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagerieConversationAssembler {

    private final MessageRepository messageRepository;
    private final ConversationParticipantRepository participantRepository;

    public ConversationResponse assemble(Conversation conversation, UUID utilisateurId) {
        Message dernierMessage = messageRepository.findLastMessage(conversation.getId());
        MessageResponse dernierMessageResponse = dernierMessage != null
                ? MessageResponse.fromEntity(dernierMessage)
                : null;

        long nonLus = messageRepository.countUnread(conversation.getId(), utilisateurId);
        List<ParticipantResponse> participants = participantRepository.findByConversationId(conversation.getId())
                .stream()
                .map(ParticipantResponse::fromEntity)
                .collect(Collectors.toList());

        ConversationResponse response = ConversationResponse.fromEntity(conversation);
        response.setDernierMessage(dernierMessageResponse);
        response.setNombreNonLus((int) nonLus);
        response.setParticipants(participants);
        return response;
    }
}
