package com.sencarmarket.module.annonce.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.commun.enums.StatutReservation;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "annonce_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnonceLocation {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id")
    private Utilisateur proprietaire;

    @Column(name = "tarif_journalier", precision = 12, scale = 2)
    private BigDecimal tarifJournalier;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutReservation statut;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions;

    @Column(name = "caution", precision = 12, scale = 2)
    private BigDecimal caution;

    @Column(name = "kilometrage_inclus")
    private Integer kilometrageInclus;

    @Column(name = "tarif_km_supplementaire", precision = 12, scale = 2)
    private BigDecimal tarifKmSupplementaire;

    @Column(name = "actif")
    private Boolean actif;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
