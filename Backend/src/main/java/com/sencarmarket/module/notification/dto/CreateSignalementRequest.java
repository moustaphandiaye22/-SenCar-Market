package com.sencarmarket.module.notification.dto;

import com.sencarmarket.module.notification.enums.MotifSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO pour créer un signalement (Module 11 - Modération)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSignalementRequest {

    @NotNull(message = "L'ID de l'utilisateur est requis")
    private UUID utilisateurId;

    @NotNull(message = "Le type d'entité est requis")
    private TypeEntiteSignalable typeEntite;

    @NotNull(message = "L'ID de l'entité est requis")
    private UUID entiteId;

    @NotNull(message = "Le motif est requis")
    private MotifSignalement motif;

    @NotBlank(message = "La description est requise")
    private String description;
}
