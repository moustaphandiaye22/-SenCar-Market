package com.sencarmarket.module.avis.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité représentant un avis
 */
@Entity
@Table(name = "avis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Utilisateur auteur;

    // Cible de l'avis (utilisateur, véhicule, garage)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cible_utilisateur_id")
    private Utilisateur cibleUtilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "garage_id")
    private com.sencarmarket.module.garage.entity.Garage garage;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_avis")
    private TypeAvis typeAvis;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "note", nullable = false)
    private Integer note;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutAvis statut;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TypeAvis {
        ACHAT_VEHICULE,
        LOCATION_VEHICULE,
        SERVICE_GARAGE,
        VENDEUR,
        ACHETEUR
    }

    public enum StatutAvis {
        EN_ATTENTE,
        PUBLIE,
        SIGNALEE,
        SUPPRIMEE
    }
}
