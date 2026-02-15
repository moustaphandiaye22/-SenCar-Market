package com.sencarmarket.module.abonnement.entity;

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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "abonnement_id")
    private UUID abonnementId;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "statut")
    private String statut;

    @Column(name = "nombre_annonces_utilisees")
    private Integer nombreAnnoncesUtilisees;
}
