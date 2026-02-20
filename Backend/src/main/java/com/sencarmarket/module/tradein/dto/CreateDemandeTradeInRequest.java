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
public class CreateDemandeTradeInRequest {

    @NotNull(message = "L'ID du véhicule actuel est requis")
    private UUID vehiculeActuelId;

    private UUID vehiculeSouhaiteId;

    @NotNull(message = "Le kilométrage actuel est requis")
    @Positive(message = "Le kilométrage doit être positif")
    private Integer kilometrageActuel;

    @NotNull(message = "L'état du véhicule est requis")
    private String etatVehicule;
}
