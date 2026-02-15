package com.sencarmarket.module.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation_participant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationParticipant {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "conversation_id")
    private UUID conversationId;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "date_join")
    private LocalDateTime dateJoin;

    @Column(name = "est_admin")
    private Boolean estAdmin;
}
