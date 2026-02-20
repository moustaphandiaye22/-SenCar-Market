package com.sencarmarket.module.notification.entity;

import com.sencarmarket.module.notification.enums.MotifSignalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité représentant un signalement (Module 11 - Modération)
 */
@Entity
@Table(name = "signalement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "utilisateur_id", nullable = false)
    private UUID utilisateurId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_entite", nullable = false)
    private TypeEntiteSignalable typeEntite;

    @Column(name = "entite_id", nullable = false)
    private UUID entiteId;

    @Enumerated(EnumType.STRING)
    @Column(name = "motif", nullable = false)
    private MotifSignalement motif;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_traitement", nullable = false)
    @Builder.Default
    private StatutTraitementSignalement statutTraitement = StatutTraitementSignalement.EN_ATTENTE;

    @Column(name = "action_admin")
    private String actionAdmin;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "date_signalement", nullable = false)
    private LocalDateTime dateSignalement;

    @PrePersist
    protected void onCreate() {
        if (dateSignalement == null) {
            dateSignalement = LocalDateTime.now();
        }
    }
}
