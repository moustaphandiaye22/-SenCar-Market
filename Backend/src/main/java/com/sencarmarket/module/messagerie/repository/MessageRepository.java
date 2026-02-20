package com.sencarmarket.module.messagerie.repository;

import com.sencarmarket.module.messagerie.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'entité Message
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    // Messages d'une conversation
    Page<Message> findByConversationIdOrderByDateEnvoiDesc(UUID conversationId, Pageable pageable);

    // Messages non lus d'un utilisateur dans une conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.utilisateur.id != :utilisateurId AND m.estLu = false")
    List<Message> findUnreadMessages(@Param("conversationId") UUID conversationId, 
                                     @Param("utilisateurId") UUID utilisateurId);

    // Compter les messages non lus
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.utilisateur.id != :utilisateurId AND m.estLu = false")
    long countUnread(@Param("conversationId") UUID conversationId, @Param("utilisateurId") UUID utilisateurId);

    // Dernier message d'une conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.dateEnvoi DESC LIMIT 1")
    Message findLastMessage(@Param("conversationId") UUID conversationId);

    // Marquer tous les messages comme lus
    @Modifying
    @Query("UPDATE Message m SET m.estLu = true, m.dateLecture = CURRENT_TIMESTAMP " +
           "WHERE m.conversation.id = :conversationId AND m.utilisateur.id != :utilisateurId")
    void markAllAsRead(@Param("conversationId") UUID conversationId, @Param("utilisateurId") UUID utilisateurId);

    // Messages épinglés
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.estEpingle = true")
    List<Message> findPinnedMessages(@Param("conversationId") UUID conversationId);

    // Rechercher dans les messages d'une conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.estSupprime = false AND LOWER(m.contenu) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY m.dateEnvoi DESC")
    Page<Message> searchMessages(@Param("conversationId") UUID conversationId, 
                                @Param("query") String query, Pageable pageable);
}
