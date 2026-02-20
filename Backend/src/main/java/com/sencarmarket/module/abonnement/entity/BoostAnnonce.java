package com.sencarmarket.module.abonnement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "boost_annonce")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoostAnnonce {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "annonce_location_id", nullable = false)
    private UUID annonceLocationId;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "niveau_boost")
    private String niveauBoost;
}
