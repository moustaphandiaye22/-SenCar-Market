package com.sencarmarket.module.garage.dto;

import com.sencarmarket.module.garage.entity.ServiceGarage;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour la création d'un service garage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceGarageRequest {

    @NotBlank(message = "Le nom du service est requis")
    private String nom;

    private String description;

    @Min(value = 0, message = "Le prix doit être positif")
    private BigDecimal prix;

    @Min(value = 1, message = "La durée estimée doit être au moins 1 minute")
    private Integer dureeEstimee;

    private String categorie; // ENTRETIEN, REPARATION, DIAGNOSTIC, CARROSSERIE, AUTRE
}
