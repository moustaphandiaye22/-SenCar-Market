package com.sencarmarket.module.annonce.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.StatutAnnonce;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "annonce_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnonceLocation {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id")
    private Utilisateur proprietaire;

    @Column(name = "tarif_journalier", precision = 12, scale = 2)
    private BigDecimal tarifJournalier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statut_id")
    private StatutAnnonce statut;
}
