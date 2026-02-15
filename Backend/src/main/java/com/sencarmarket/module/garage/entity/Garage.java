package com.sencarmarket.module.garage.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "garage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Garage {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "horaires_ouverture")
    private String horairesOuverture;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription;
}
