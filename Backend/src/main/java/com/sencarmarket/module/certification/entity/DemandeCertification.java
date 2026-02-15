package com.sencarmarket.module.certification.entity;

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
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "vehicule_id")
    private UUID vehiculeId;

    @Column(name = "statut")
    private String statut;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;
}
