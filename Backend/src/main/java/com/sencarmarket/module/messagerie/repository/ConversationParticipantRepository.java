package com.sencarmarket.module.messagerie.repository;

import com.sencarmarket.module.messagerie.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour l'entité ConversationParticipant
 */
@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {

    // Participants d'une conversation
    List<ConversationParticipant> findByConversationId(UUID conversationId);

    // Participant spécifique
    Optional<ConversationParticipant> findByConversationIdAndUtilisateurId(UUID conversationId, UUID utilisateurId);

    // Vérifier si un utilisateur est participant
    boolean existsByConversationIdAndUtilisateurId(UUID conversationId, UUID utilisateurId);

    // Compter les participants
    long countByConversationId(UUID conversationId);
}
