package com.sencarmarket.module.assurance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "produit_assurance_id")
    private UUID produitAssuranceId;

    @Column(name = "vehicule_id")
    private UUID vehiculeId;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "statut")
    private String statut;
}
