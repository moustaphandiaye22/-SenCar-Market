package com.sencarmarket.module.vehicule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "etat_vehicule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtatVehicule {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;
}
