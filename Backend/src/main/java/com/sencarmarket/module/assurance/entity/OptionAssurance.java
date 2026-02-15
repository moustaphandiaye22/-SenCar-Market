package com.sencarmarket.module.assurance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "option_assurance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionAssurance {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "produit_assurance_id")
    private UUID produitAssuranceId;

    @Column(name = "nom")
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix_supplementaire", precision = 12, scale = 2)
    private BigDecimal prixSupplementaire;
}
