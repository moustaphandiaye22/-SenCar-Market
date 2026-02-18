package com.sencarmarket.module.assurance.entity;

import com.sencarmarket.module.assurance.enums.StatutAssurance;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "souscription_assurance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SouscriptionAssurance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_assurance_id", nullable = false)
    private ProduitAssurance produitAssurance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    private Vehicule vehicule;

    @ManyToMany
    @JoinTable(
        name = "souscription_options",
        joinColumns = @JoinColumn(name = "souscription_id"),
        inverseJoinColumns = @JoinColumn(name = "option_id")
    )
    @Builder.Default
    private List<OptionAssurance> optionsSelectionnees = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutAssurance statut;

    @Column(name = "montant_total", precision = 12, scale = 2, nullable = false)
    private BigDecimal montantTotal;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "numero_contrat")
    private String numeroContrat;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "paiement_id")
    private UUID paiementId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (statut == null) {
            statut = StatutAssurance.EN_ATTENTE;
        }
        // Générer numéro de contrat
        if (numeroContrat == null) {
            numeroContrat = "ASC-" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
