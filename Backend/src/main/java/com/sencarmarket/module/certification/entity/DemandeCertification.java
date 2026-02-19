package com.sencarmarket.module.certification.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "demande_certification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    private Vehicule vehicule;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutDemande statut;

    @Column(name = "montant_paiement")
    private Double montantPaiement;

    @Column(name = "paiement_id")
    private UUID paiementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspecteur_id")
    private Utilisateur inspecteur;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "date_inspection")
    private LocalDateTime dateInspection;

    @Column(name = "motif_rejet")
    private String motifRejet;

    @Column(name = "badge_certifie_url")
    private String badgeCertifieUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (statut == null) {
            statut = StatutDemande.EN_ATTENTE;
        }
        if (dateSoumission == null) {
            dateSoumission = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum StatutDemande {
        EN_ATTENTE,
        PAYEE,
        INSPECTION_PROGRAMMEE,
        INSPECTE,
        CERTIFIEE,
        REJETEE
    }
}
