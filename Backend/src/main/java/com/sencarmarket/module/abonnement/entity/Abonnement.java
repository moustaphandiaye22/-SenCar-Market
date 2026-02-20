package com.sencarmarket.module.abonnement.entity;

import com.sencarmarket.module.abonnement.enums.TypeAbonnement;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "abonnement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix_mensuel", precision = 12, scale = 2)
    private BigDecimal prixMensuel;

    @Column(name = "duree_jours")
    private Integer dureeJours;

    @Column(name = "nombre_annonces")
    private Integer nombreAnnonces;

    @Column(name = "est_vedette")
    private Boolean estVedette;

    @Column(name = "est_certifie")
    private Boolean estCertifie;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TypeAbonnement type;

    @Column(name = "est_actif")
    @Builder.Default
    private Boolean estActif = true;

    // Liste des avantages (stockée en JSON ou CSV)
    @Column(name = "avantages", columnDefinition = "TEXT")
    private String avantages;

    // Prix annuel (optionnel)
    @Column(name = "prix_annuel", precision = 12, scale = 2)
    private BigDecimal prixAnnuel;

    // Nombre de boosts gratuits par mois
    @Column(name = "nombre_boosts_gratuits")
    private Integer nombreBoostsGratuits;

    // Accès prioritaire
    @Column(name = "acces_prioritaire")
    private Boolean accesPrioritaire;

    // Support prioritaire
    @Column(name = "support_prioritaire")
    private Boolean supportPrioritaire;
}
