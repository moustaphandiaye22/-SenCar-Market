package com.sencarmarket.module.tradein.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historique_estimation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueEstimation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vehicule_id")
    private UUID vehiculeId;

    @Column(name = "marque")
    private String marque;

    @Column(name = "modele")
    private String modele;

    @Column(name = "annee_fabrication")
    private Integer anneeFabrication;

    @Column(name = "kilometrage")
    private Integer kilometrage;

    @Column(name = "etat_vehicule")
    private String etatVehicule;

    @Column(name = "prix_estime", precision = 12, scale = 2)
    private BigDecimal prixEstime;

    @Column(name = "prix_minimum", precision = 12, scale = 2)
    private BigDecimal prixMinimum;

    @Column(name = "prix_maximum", precision = 12, scale = 2)
    private BigDecimal prixMaximum;

    @Column(name = "score_condition")
    private Double scoreCondition;

    @Column(name = "recommandation")
    private String recommandation;

    @Column(name = "date_estimation")
    private LocalDateTime dateEstimation;

    @PrePersist
    protected void onCreate() {
        if (dateEstimation == null) {
            dateEstimation = LocalDateTime.now();
        }
    }
}
