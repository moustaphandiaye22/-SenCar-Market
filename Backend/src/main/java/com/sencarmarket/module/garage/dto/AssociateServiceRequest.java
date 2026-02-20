package com.sencarmarket.module.garage.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO pour associer un service à un garage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssociateServiceRequest {

    @NotNull(message = "L'ID du garage est requis")
    private UUID garageId;

    @NotNull(message = "L'ID du service est requis")
    private UUID serviceId;

    @Min(value = 0, message = "Le prix doit être positif")
    private BigDecimal prix;

    @Min(value = 1, message = "La durée estimée doit être au moins 1 minute")
    private Integer dureeEstimee;
}
