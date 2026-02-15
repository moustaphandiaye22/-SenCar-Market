package com.sencarmarket.module.vehicule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "modele")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modele {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marque_id")
    private Marque marque;

    @Column(name = "nom")
    private String nom;
}
