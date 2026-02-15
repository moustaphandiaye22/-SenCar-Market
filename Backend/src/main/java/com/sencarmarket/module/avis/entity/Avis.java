package com.sencarmarket.module.avis.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "avis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avis {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cible_utilisateur_id")
    private Utilisateur cibleUtilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @Column(name = "note")
    private Integer note;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
