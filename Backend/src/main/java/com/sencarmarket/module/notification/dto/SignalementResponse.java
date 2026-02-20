package com.sencarmarket.module.notification.dto;

import com.sencarmarket.module.notification.enums.MotifSignalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un signalement (Module 11 - Modération)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignalementResponse {

    private UUID id;
    private UUID utilisateurId;
    private String utilisateurNom;
    private TypeEntiteSignalable typeEntite;
    private UUID entiteId;
    private MotifSignalement motif;
    private String description;
    private StatutTraitementSignalement statutTraitement;
    private String actionAdmin;
    private UUID adminId;
    private LocalDateTime dateTraitement;
    private LocalDateTime dateSignalement;
}
