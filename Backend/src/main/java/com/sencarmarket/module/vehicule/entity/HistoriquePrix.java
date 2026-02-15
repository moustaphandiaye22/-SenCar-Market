package com.sencarmarket.module.vehicule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historique_prix")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriquePrix {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @Column(name = "ancien_prix", precision = 12, scale = 2)
    private BigDecimal ancienPrix;

    @Column(name = "nouveau_prix", precision = 12, scale = 2)
    private BigDecimal nouveauPrix;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}
