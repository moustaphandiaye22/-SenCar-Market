package com.sencarmarket.module.garage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité représentant un garage
 * Statut: EN_ATTENTE, ACTIF, SUSPENDU, REJET
 */
@Entity
@Table(name = "garage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Garage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "adresse", nullable = false)
    private String adresse;

    @Column(name = "telephone", nullable = false)
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "horaires_ouverture")
    private String horairesOuverture;

    // Localisation
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "ville")
    private String ville;

    @Column(name = "pays")
    private String pays;

    // Logo
    @Column(name = "logo_url")
    private String logoUrl;

    // Validation admin
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation")
    private StatutValidation statutValidation;

    @Column(name = "commentaire_admin")
    private String commentaireAdmin;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    // Propriétaire
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private com.sencarmarket.module.utilisateur.entity.Utilisateur proprietaire;

    // Timestamps
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum StatutValidation {
        EN_ATTENTE,
        ACTIF,
        SUSPENDU,
        REJET
    }
}
