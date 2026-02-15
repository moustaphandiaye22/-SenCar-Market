package com.sencarmarket.module.annonce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "disponibilite_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibiliteLocation {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonce_location_id")
    private AnnonceLocation annonceLocation;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "est_disponible")
    private Boolean estDisponible;
}
