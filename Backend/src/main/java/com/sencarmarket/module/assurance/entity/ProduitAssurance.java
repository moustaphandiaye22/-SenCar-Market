package com.sencarmarket.module.assurance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix_base", precision = 12, scale = 2)
    private BigDecimal prixBase;
}
