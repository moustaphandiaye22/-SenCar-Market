package com.sencarmarket.module.notification.dto;

import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO pour l'action admin sur un signalement (Module 11 - Modération)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionAdminRequest {

    @NotNull(message = "Le statut de traitement est requis")
    private StatutTraitementSignalement nouveauStatut;

    @NotBlank(message = "L'action admin est requise")
    private String actionAdmin;

    @NotNull(message = "L'ID de l'admin est requis")
    private UUID adminId;
}
