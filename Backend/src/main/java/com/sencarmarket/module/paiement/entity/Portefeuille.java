package com.sencarmarket.module.paiement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "portefeuille")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portefeuille {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", unique = true)
    private com.sencarmarket.module.utilisateur.entity.Utilisateur utilisateur;

    @Column(name = "solde", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal solde = BigDecimal.ZERO;

    @Column(name = "solde_bloque", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal soldeBloque = BigDecimal.ZERO;

    @Column(name = "date_derniere_recharge")
    private LocalDateTime dateDerniereRecharge;

    @Column(name = "is_actif")
    @Builder.Default
    private Boolean isActif = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (solde == null) {
            solde = BigDecimal.ZERO;
        }
        if (soldeBloque == null) {
            soldeBloque = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public BigDecimal getSoldeDisponible() {
        return (solde != null ? solde : BigDecimal.ZERO)
                .subtract(soldeBloque != null ? soldeBloque : BigDecimal.ZERO);
    }
}
