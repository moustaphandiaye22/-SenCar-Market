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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "solde", precision = 12, scale = 2)
    private BigDecimal solde;

    @Column(name = "date_derniere_recharge")
    private LocalDateTime dateDerniereRecharge;
}
