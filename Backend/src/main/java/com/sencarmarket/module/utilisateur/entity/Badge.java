package com.sencarmarket.module.utilisateur.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "badge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;
}
