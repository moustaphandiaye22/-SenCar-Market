package com.sencarmarket.module.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "signalement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signalement {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "annonce_id")
    private UUID annonceId;

    @Column(name = "type_signalement")
    private String typeSignalement;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "statut")
    private String statut;

    @Column(name = "date_signalement")
    private LocalDateTime dateSignalement;
}
