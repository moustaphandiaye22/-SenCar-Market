package com.sencarmarket.module.assurance.entity;

import com.sencarmarket.module.assurance.enums.TypeAssurance;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "produit_assurance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduitAssurance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix_base", precision = 12, scale = 2, nullable = false)
    private BigDecimal prixBase;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_assurance", nullable = false)
    private TypeAssurance typeAssurance;

    @Column(name = "duree_mois")
    private Integer dureeMois; // Durée en mois

    @Column(name = "est_actif")
    private Boolean estActif;

    @OneToMany(mappedBy = "produitAssurance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OptionAssurance> options = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estActif == null) {
            estActif = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
