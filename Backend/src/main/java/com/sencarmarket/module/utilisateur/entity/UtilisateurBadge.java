package com.sencarmarket.module.utilisateur.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "utilisateur_badge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurBadge {

    @Id
    @Column(name = "utilisateur_id", nullable = false)
    private UUID utilisateurId;

    @Id
    @Column(name = "badge_id", nullable = false)
    private UUID badgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Badge badge;
}
