package com.sencarmarket.module.abonnement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité pour l'historique des abonnements
 * Suit chaque événement (souscription, renouvellement, expiration, etc.)
 */
@Entity
@Table(name = "historique_abonnement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id", nullable = false)
    private UUID utilisateurId;

    @Column(name = "abonnement_id")
    private UUID abonnementId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_evenement")
    private TypeEvenementAbonnement typeEvenement;

    @Column(name = "date_evenement")
    private LocalDateTime dateEvenement;

    @Column(name = "description")
    private String description;

    @Column(name = "paiement_id")
    private UUID paiementId;

    @Column(name = "montant")
    private Double montant;

    // Enum pour les types d'événements
    public enum TypeEvenementAbonnement {
        SOUSCRIPTION,
        RENOUVELLEMENT,
        ANNULATION,
        EXPIRATION,
        PAIEMENT,
        REMBOURSEMENT,
        UPGRADE,
        DOWNGRADE
    }
}
