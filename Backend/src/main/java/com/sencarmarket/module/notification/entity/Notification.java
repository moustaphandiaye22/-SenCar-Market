package com.sencarmarket.module.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "titre")
    private String titre;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "type")
    private String type;

    @Column(name = "est_lu")
    private Boolean estLu;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
}
