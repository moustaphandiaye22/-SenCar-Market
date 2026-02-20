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
 * Entité représentant un service proposé par un garage
 * Ex: Vidange, Réparation freins, Pneumatiques, etc.
 */
@Entity
@Table(name = "service_garage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ServiceGarage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix", precision = 12, scale = 2)
    private BigDecimal prix;

    @Column(name = "duree_estimee")
    private Integer dureeEstimee; // en minutes

    @Column(name = "categorie")
    private String categorie; // ENTRETIEN, REPARATION, DIAGNOSTIC, CARROSSERIE

    @Column(name = "actif")
    private Boolean actif;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Categorie {
        ENTRETIEN,
        REPARATION,
        DIAGNOSTIC,
        CARROSSERIE,
        AUTRE
    }
}
