package com.sencarmarket.module.messagerie.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "conversation_id")
    private UUID conversationId;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "contenu", columnDefinition = "TEXT")
    private String contenu;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    @Column(name = "est_lu")
    private Boolean estLu;
}
