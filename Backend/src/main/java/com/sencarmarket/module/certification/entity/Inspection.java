package com.sencarmarket.module.certification.entity;

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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "demande_certification_id")
    private UUID demandeCertificationId;

    @Column(name = "inspecteur_id")
    private UUID inspecteurId;

    @Column(name = "date_inspection")
    private LocalDateTime dateInspection;

    @Column(name = "resultat")
    private String resultat;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "kilometrage")
    private Integer kilometrage;

    @Column(name = "etat_generateur")
    private String etatGenerateur;

    @Column(name = "etat_freinage")
    private String etatFreinage;

    @Column(name = "etat_suspension")
    private String etatSuspension;

    @Column(name = "etat_transmission")
    private String etatTransmission;
}
