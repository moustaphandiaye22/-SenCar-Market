package com.sencarmarket.module.paiement.entity;

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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "portefeuille_id")
    private UUID portefeuilleId;

    @Column(name = "montant", precision = 12, scale = 2)
    private BigDecimal montant;

    @Column(name = "type_transaction")
    private String typeTransaction;

    @Column(name = "description")
    private String description;

    @Column(name = "date_transaction")
    private LocalDateTime dateTransaction;
}
