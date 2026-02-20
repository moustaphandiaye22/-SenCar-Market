package com.sencarmarket.module.messagerie.repository;

import com.sencarmarket.module.messagerie.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour l'entité Conversation
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    // Conversations d'un utilisateur
    @Query("SELECT c FROM Conversation c JOIN ConversationParticipant cp ON c = cp.conversation WHERE cp.utilisateur.id = :utilisateurId ORDER BY c.updatedAt DESC")
    Page<Conversation> findByParticipantId(@Param("utilisateurId") UUID utilisateurId, Pageable pageable);

    // Conversation directe entre deux utilisateurs
    @Query("SELECT c FROM Conversation c JOIN ConversationParticipant cp1 ON c = cp1.conversation " +
           "JOIN ConversationParticipant cp2 ON c = cp2.conversation " +
           "WHERE cp1.utilisateur.id = :utilisateurId1 AND cp2.utilisateur.id = :utilisateurId2 " +
           "AND c.typeConversation = 'DIRECT'")
    Optional<Conversation> findDirectConversation(@Param("utilisateurId1") UUID utilisateurId1, 
                                                  @Param("utilisateurId2") UUID utilisateurId2);

    // Conversations par annonce
    List<Conversation> findByAnnonceId(UUID annonceId);

    // Rechercher par titre
    @Query("SELECT c FROM Conversation c JOIN ConversationParticipant cp ON c = cp.conversation " +
           "WHERE cp.utilisateur.id = :utilisateurId AND LOWER(c.titre) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Conversation> search(@Param("utilisateurId") UUID utilisateurId, @Param("query") String query);
}
