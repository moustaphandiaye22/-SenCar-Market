package com.sencarmarket.module.abonnement.entity;

import com.sencarmarket.module.abonnement.enums.StatutAbonnement;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateur_abonnement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id", nullable = false)
    private UUID utilisateurId;

    @Column(name = "abonnement_id", nullable = false)
    private UUID abonnementId;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutAbonnement statut;

    @Column(name = "nombre_annonces_utilisees")
    private Integer nombreAnnoncesUtilisees;

    // Période d'essai gratuite
    @Column(name = "est_essai_gratuit")
    private Boolean estEssaiGratuit;

    @Column(name = "date_fin_essai")
    private LocalDateTime dateFinEssai;
}
