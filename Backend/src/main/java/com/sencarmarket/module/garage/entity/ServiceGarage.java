package com.sencarmarket.module.garage.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "service_garage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceGarage {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix", precision = 12, scale = 2)
    private BigDecimal prix;

    @Column(name = "duree_estimee")
    private Integer dureeEstimee;
}
