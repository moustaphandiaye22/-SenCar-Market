package com.sencarmarket.module.vehicule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stat_vehicule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatVehicule {

    @Id
    @Column(name = "vehicule_id", nullable = false)
    private UUID vehiculeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @Column(name = "total_vues")
    private Integer totalVues;

    @Column(name = "total_favoris")
    private Integer totalFavoris;

    @Column(name = "total_reservations")
    private Integer totalReservations;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
