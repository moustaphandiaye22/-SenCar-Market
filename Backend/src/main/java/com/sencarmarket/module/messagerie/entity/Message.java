package com.sencarmarket.module.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité représentant un message
 */
@Entity
@Table(name = "message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private com.sencarmarket.module.utilisateur.entity.Utilisateur utilisateur;

    @Column(name = "contenu", columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @CreatedDate
    @Column(name = "date_envoi", nullable = false, updatable = false)
    private LocalDateTime dateEnvoi;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @Column(name = "est_lu")
    private Boolean estLu;

    @Column(name = "est_supprime")
    private Boolean estSupprime;

    @Column(name = "est_epingle")
    private Boolean estEpingle;

    // Pour les messages de type "système"
    @Column(name = "type_message")
    private String typeMessage; // TEXTE, IMAGE, SYSTEM
}
