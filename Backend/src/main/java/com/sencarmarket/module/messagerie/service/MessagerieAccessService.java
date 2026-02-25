package com.sencarmarket.module.messagerie.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.messagerie.entity.Conversation;
import com.sencarmarket.module.messagerie.entity.ConversationParticipant;
import com.sencarmarket.module.messagerie.entity.Message;
import com.sencarmarket.module.messagerie.repository.ConversationParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessagerieAccessService {

    private final ConversationParticipantRepository participantRepository;

    public void ensureParticipant(UUID conversationId, UUID utilisateurId) {
        boolean isParticipant = participantRepository.existsByConversationIdAndUtilisateurId(conversationId, utilisateurId);
        if (!isParticipant) {
            throw new InvalidOperationException(AppMessages.MESSAGERIE_NOT_PARTICIPANT);
        }
    }

    public ConversationParticipant ensureAdmin(UUID conversationId, UUID utilisateurId) {
        ConversationParticipant participant = participantRepository
                .findByConversationIdAndUtilisateurId(conversationId, utilisateurId)
                .orElseThrow(() -> new InvalidOperationException(AppMessages.MESSAGERIE_NOT_PARTICIPANT));

        if (participant.getEstAdmin() == null || !participant.getEstAdmin()) {
            throw new InvalidOperationException(AppMessages.MESSAGERIE_ADMIN_REQUIRED);
        }
        return participant;
    }

    public void ensureMessageOwner(Message message, UUID utilisateurId) {
        if (message.getUtilisateur() == null || !message.getUtilisateur().getId().equals(utilisateurId)) {
            throw new InvalidOperationException(AppMessages.MESSAGERIE_CANNOT_DELETE_MESSAGE);
        }
    }

    public ConversationParticipant getParticipantOrThrow(UUID conversationId, UUID utilisateurId) {
        return participantRepository.findByConversationIdAndUtilisateurId(conversationId, utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.MESSAGERIE_NOT_PARTICIPANT));
    }

    public void ensureCanLeaveConversation(Conversation conversation, ConversationParticipant participant) {
        if (conversation.getTypeConversation() == Conversation.TypeConversation.DIRECT) {
            throw new InvalidOperationException(AppMessages.MESSAGERIE_CANNOT_LEAVE_DIRECT);
        }

        if (participant.getEstAdmin() != null && participant.getEstAdmin()) {
            long adminCount = participantRepository.findByConversationId(conversation.getId()).stream()
                    .filter(p -> p.getEstAdmin() != null && p.getEstAdmin())
                    .count();
            if (adminCount <= 1) {
                throw new InvalidOperationException(AppMessages.MESSAGERIE_LAST_ADMIN_CANNOT_LEAVE);
            }
        }
    }
}
