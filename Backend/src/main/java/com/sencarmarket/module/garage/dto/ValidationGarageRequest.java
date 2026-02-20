package com.sencarmarket.module.garage.dto;

import com.sencarmarket.module.garage.entity.Garage;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la validation administrative d'un garage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationGarageRequest {

    @NotNull(message = "Le nouveau statut est requis")
    private Garage.StatutValidation nouveauStatut;

    private String commentaireAdmin;
}
