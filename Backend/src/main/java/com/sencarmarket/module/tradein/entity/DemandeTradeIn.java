package com.sencarmarket.module.tradein.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "demande_trade_in")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeTradeIn {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "vehicule_actuel_id")
    private UUID vehiculeActuelId;

    @Column(name = "vehicule_souhaite_id")
    private UUID vehiculeSouhaiteId;

    @Column(name = "statut")
    private String statut;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "prix_offert", precision = 12, scale = 2)
    private java.math.BigDecimal prixOffert;
}
