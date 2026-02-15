package com.sencarmarket.module.certification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rapport_inspection")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportInspection {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "inspection_id")
    private UUID inspectionId;

    @Column(name = "url_rapport")
    private String urlRapport;

    @Column(name = "date_generation")
    private LocalDateTime dateGeneration;

    @Column(name = "score_globale")
    private Integer scoreGlobale;
}
