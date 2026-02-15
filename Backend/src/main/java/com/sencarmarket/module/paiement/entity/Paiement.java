package com.sencarmarket.module.paiement.entity;

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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "reservation_id")
    private UUID reservationId;

    @Column(name = "montant", precision = 12, scale = 2)
    private BigDecimal montant;

    @Column(name = "statut")
    private String statut;

    @Column(name = "methode_paiement")
    private String methodePaiement;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;

    @Column(name = "reference_transaction")
    private String referenceTransaction;
}
