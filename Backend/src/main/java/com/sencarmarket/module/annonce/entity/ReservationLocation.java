package com.sencarmarket.module.annonce.entity;

import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.StatutAnnonce;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservation_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationLocation {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonce_location_id")
    private AnnonceLocation annonceLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locataire_id")
    private Utilisateur locataire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statut_id")
    private StatutAnnonce statut;

    @Column(name = "cout_total", precision = 12, scale = 2)
    private BigDecimal coutTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paiement_id")
    private Paiement paiement;
}
