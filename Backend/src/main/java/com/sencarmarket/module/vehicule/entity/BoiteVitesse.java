package com.sencarmarket.module.vehicule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "boite_vitesse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoiteVitesse {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;
}
