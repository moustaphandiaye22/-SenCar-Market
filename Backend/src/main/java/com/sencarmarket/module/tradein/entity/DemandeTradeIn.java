package com.sencarmarket.module.tradein.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_actuel_id", nullable = false)
    private Vehicule vehiculeActuel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_souhaite_id")
    private Vehicule vehiculeSouhaite;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutTradeIn statut;

    @Column(name = "prix_estime", precision = 12, scale = 2)
    private BigDecimal prixEstime;

    @Column(name = "prix_propose", precision = 12, scale = 2)
    private BigDecimal prixPropose;

    @Column(name = "kilometrage_actuel")
    private Integer kilometrageActuel;

    @Column(name = "etat_vehicule")
    private String etatVehicule;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "date_evaluation")
    private LocalDateTime dateEvaluation;

    @Column(name = "motif_rejet")
    private String motifRejet;

    @Column(name = "commentaire_admin")
    private String commentaireAdmin;

    @Column(name = "est_notifie")
    private Boolean estNotifie;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (statut == null) {
            statut = StatutTradeIn.EN_ATTENTE;
        }
        if (dateSoumission == null) {
            dateSoumission = LocalDateTime.now();
        }
        if (estNotifie == null) {
            estNotifie = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum StatutTradeIn {
        EN_ATTENTE,
        EN_COURS_EVALUATION,
        EVALUATION_TERMINEE,
        ACCEPTE,
        REJETEE,
        ANNULEE
    }
}
