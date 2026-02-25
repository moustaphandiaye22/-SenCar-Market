package com.sencarmarket.module.abonnement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO pour s'abonner à un plan
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SouscriptionRequest {

    private UUID utilisateurId;

    @NotNull(message = "L'ID de l'abonnement est requis")
    private UUID abonnementId;

    private UUID paiementId;
}
