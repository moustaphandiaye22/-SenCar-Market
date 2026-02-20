package com.sencarmarket.module.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entité représentant une conversation
 * Type: DIRECT (entre deux utilisateurs) ou GROUP (plusieurs utilisateurs)
 */
@Entity
@Table(name = "conversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "titre")
    private String titre;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_conversation")
    private TypeConversation typeConversation;

    // Conversation liée à une annonce (optionnel)
    @Column(name = "annonce_id")
    private UUID annonceId;

    // Message épinglé
    @Column(name = "message_epinglé_id")
    private UUID messageEpingleId;

    // Avatar du groupe
    @Column(name = "avatar_url")
    private String avatarUrl;

    // Timestamps
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Dernier message (non persisté en DB, mis à jour par le service)
    @Transient
    private Message dernierMessage;

    @Transient
    private Integer nombreMessagesNonLus;

    public enum TypeConversation {
        DIRECT,
        GROUP
    }
}
