package com.sencarmarket.module.tradein.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstimationRequest {

    @NotNull(message = "L'ID du véhicule est requis")
    private UUID vehiculeId;

    @NotNull(message = "Le kilométrage est requis")
    @Positive(message = "Le kilométrage doit être positif")
    private Integer kilometrage;

    @NotNull(message = "L'état du véhicule est requis")
    private String etatVehicule;
}
