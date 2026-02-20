package com.sencarmarket.module.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité représentant un participant à une conversation
 */
@Entity
@Table(name = "conversation_participant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ConversationParticipant {

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

    @CreatedDate
    @Column(name = "date_join", nullable = false, updatable = false)
    private LocalDateTime dateJoin;

    @Column(name = "est_admin")
    private Boolean estAdmin;

    @Column(name = "est_mute")
    private Boolean estMute;

    @Column(name = "derniere_lecture_date")
    private LocalDateTime derniereLectureDate;

    @Column(name = "nombre_non_lus")
    private Integer nombreNonLus;
}
