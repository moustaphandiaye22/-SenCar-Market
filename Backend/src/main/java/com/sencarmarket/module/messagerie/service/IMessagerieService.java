package com.sencarmarket.module.messagerie.service;

import com.sencarmarket.module.messagerie.entity.Conversation;
import com.sencarmarket.module.messagerie.entity.ConversationParticipant;
import com.sencarmarket.module.messagerie.entity.Message;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service messagerie
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IMessagerieService {

    // Conversation
    Conversation createConversation(Conversation conversation);

    Conversation addParticipant(UUID conversationId, UUID utilisateurId);

    Conversation removeParticipant(UUID conversationId, UUID utilisateurId);

    Conversation getConversationById(UUID id);

    List<Conversation> getConversationsByUtilisateur(UUID utilisateurId);

    List<Conversation> getConversationsByAnnonce(UUID annonceId);

    // Message
    Message sendMessage(Message message);

    Message getMessageById(UUID id);

    List<Message> getMessagesByConversation(UUID conversationId);

    List<Message> getMessagesByUtilisateur(UUID utilisateurId);

    void deleteMessage(UUID id);

    // Participant
    ConversationParticipant getParticipant(UUID conversationId, UUID utilisateurId);

    List<ConversationParticipant> getParticipantsByConversation(UUID conversationId);
}
