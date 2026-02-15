package com.sencarmarket.module.vehicule.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicule {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendeur_id")
    private Utilisateur vendeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marque_id")
    private Marque marque;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modele_id")
    private Modele modele;

    @Column(name = "annee_fabrication")
    private Integer anneeFabrication;

    @Column(name = "kilometrage")
    private Integer kilometrage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carburant_id")
    private Carburant carburant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boite_vitesse_id")
    private BoiteVitesse boiteVitesse;

    @Column(name = "couleur")
    private String couleur;

    @Column(name = "prix_vente", precision = 12, scale = 2)
    private BigDecimal prixVente;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "numero_vin", unique = true)
    private String numeroVin;

    @Column(name = "immatriculation")
    private String immatriculation;

    @Column(name = "prix_negociable")
    private Boolean prixNegociable;

    @Column(name = "certifie")
    private Boolean certifie;

    @Column(name = "statut", nullable = false)
    @Enumerated(EnumType.STRING)
    private Statut statut;

    @Column(name = "est_boost")
    private Boolean estBoost;

    @Column(name = "boost_debut")
    private LocalDateTime boostDebut;

    @Column(name = "boost_fin")
    private LocalDateTime boostFin;

    @Column(name = "vues")
    private Integer vues;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
