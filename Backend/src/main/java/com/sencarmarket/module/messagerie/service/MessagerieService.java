package com.sencarmarket.module.messagerie.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.messagerie.dto.*;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service messagerie
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface MessagerieService {

    // ========== CONVERSATION ==========

    /**
     * Créer une conversation
     */
    ConversationResponse createConversation(CreateConversationRequest request, UUID createurId);

    /**
     * Obtenir une conversation par ID
     */
    ConversationResponse getConversationById(UUID conversationId, UUID utilisateurId);

    /**
     * Obtenir les conversations d'un utilisateur
     */
    PaginatedResponse<ConversationResponse> getConversationsByUtilisateur(UUID utilisateurId, int page, int size);

    /**
     * Rechercher des conversations
     */
    List<ConversationResponse> searchConversations(UUID utilisateurId, String query);

    /**
     * Ajouter un participant
     */
    ConversationResponse addParticipant(UUID conversationId, UUID utilisateurId);

    /**
     * Retirer un participant
     */
    void removeParticipant(UUID conversationId, UUID utilisateurId);

    /**
     * Obtenir les participants d'une conversation
     */
    List<ParticipantResponse> getParticipants(UUID conversationId);

    // ========== MESSAGE ==========

    /**
     * Envoyer un message
     */
    MessageResponse sendMessage(SendMessageRequest request, UUID expediteurId);

    /**
     * Obtenir les messages d'une conversation
     */
    PaginatedResponse<MessageResponse> getMessagesByConversation(UUID conversationId, UUID utilisateurId, int page, int size);

    /**
     * Marquer les messages comme lus
     */
    void markMessagesAsRead(UUID conversationId, UUID utilisateurId);

    /**
     * Supprimer un message
     */
    void deleteMessage(UUID messageId, UUID utilisateurId);

    /**
     * Épingler un message
     */
    MessageResponse pinMessage(UUID messageId, UUID utilisateurId);

    // ========== NOTIFICATIONS TEMPS RÉEL ==========

    /**
     * Envoyer une notification de nouveau message (pour WebSocket)
     */
    void notifierNouveauMessage(MessageResponse message, List<UUID> destinatairesId);

    /**
     * Envoyer un indicateur de frappe
     */
    void sendTypingIndicator(UUID conversationId, UUID utilisateurId, boolean isTyping);

    /**
     * Rechercher dans les messages d'une conversation
     */
    PaginatedResponse<MessageResponse> searchMessages(UUID conversationId, UUID utilisateurId, String query, int page, int size);

    /**
     * Mettre à jour une conversation (titre, avatar)
     */
    ConversationResponse updateConversation(UUID conversationId, UUID utilisateurId, String titre, String avatarUrl);

    /**
     * Quitter une conversation de groupe
     */
    void leaveConversation(UUID conversationId, UUID utilisateurId);
}
