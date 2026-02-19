package com.sencarmarket.module.certification.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inspection")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_certification_id", nullable = false)
    private DemandeCertification demandeCertification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspecteur_id", nullable = false)
    private Utilisateur inspecteur;

    @Column(name = "date_inspection")
    private LocalDateTime dateInspection;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultat")
    private ResultatInspection resultat;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    // État du véhicule
    @Column(name = "kilometrage")
    private Integer kilometrage;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_moteur")
    private etatVehicule etatMoteur;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_generateur")
    private etatVehicule etatGenerateur;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_freinage")
    private etatVehicule etatFreinage;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_suspension")
    private etatVehicule etatSuspension;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_transmission")
    private etatVehicule etatTransmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_pneus")
    private etatVehicule etatPneus;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_carrosserie")
    private etatVehicule etatCarrosserie;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_interieur")
    private etatVehicule etatInterieur;

    @Column(name = "score_total")
    private Integer scoreTotal;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (dateInspection == null) {
            dateInspection = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ResultatInspection {
        EN_COURS,
        REUSSI,
        ECHEC,
        A_REVISER
    }

    public enum etatVehicule {
        BON,
        MOYEN,
        MAUVAIS,
        NON_VERIFIE
    }
}
