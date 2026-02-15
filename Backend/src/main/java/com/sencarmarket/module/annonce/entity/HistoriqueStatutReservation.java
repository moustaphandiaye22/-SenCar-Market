package com.sencarmarket.module.annonce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historique_statut_reservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueStatutReservation {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private ReservationLocation reservation;

    @Column(name = "ancien_statut_id")
    private UUID ancienStatutId;

    @Column(name = "nouveau_statut_id")
    private UUID nouveauStatutId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
