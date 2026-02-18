package com.sencarmarket.module.paiement.entity;

import com.sencarmarket.module.paiement.enums.StatutTransaction;
import com.sencarmarket.module.paiement.enums.TypeTransaction;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction_portefeuille")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionPortefeuille {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portefeuille_id")
    private Portefeuille portefeuille;

    @Column(name = "montant", precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_transaction")
    private TypeTransaction typeTransaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutTransaction statut;

    @Column(name = "description")
    private String description;

    @Column(name = "reference_externe")
    private String referenceExterne;

    @Column(name = "date_transaction")
    private LocalDateTime dateTransaction;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateTransaction == null) {
            dateTransaction = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutTransaction.EN_ATTENTE;
        }
    }
}
