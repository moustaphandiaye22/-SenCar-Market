package com.sencarmarket.module.vehicule.entity;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicule_favori")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeFavori {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    private Vehicule vehicule;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
