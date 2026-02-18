package com.sencarmarket.module.paiement.entity;

import com.sencarmarket.module.paiement.enums.StatutPaiement;
import com.sencarmarket.module.paiement.enums.TypePaiement;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "paiement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private com.sencarmarket.module.utilisateur.entity.Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private com.sencarmarket.module.annonce.entity.ReservationLocation reservation;

    @Column(name = "montant", precision = 12, scale = 2)
    private BigDecimal montant;

    @Column(name = "montant_escrow", precision = 12, scale = 2)
    private BigDecimal montantEscrow;

    @Column(name = "commission", precision = 12, scale = 2)
    private BigDecimal commission;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutPaiement statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "methode_paiement")
    private TypePaiement methodePaiement;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;

    @Column(name = "reference_transaction")
    private String referenceTransaction;

    @Column(name = "reference_externe")
    private String referenceExterne;

    @Column(name = "url_paiement")
    private String urlPaiement;

    @Column(name = "is_escrow")
    private Boolean isEscrow;

    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (statut == null) {
            statut = StatutPaiement.EN_ATTENTE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
