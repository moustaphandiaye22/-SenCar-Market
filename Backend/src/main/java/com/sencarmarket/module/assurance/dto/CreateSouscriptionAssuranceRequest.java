package com.sencarmarket.module.assurance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSouscriptionAssuranceRequest {

    @NotNull(message = "L'ID du produit d'assurance est requis")
    private UUID produitAssuranceId;

    @NotNull(message = "L'ID du véhicule est requis")
    private UUID vehiculeId;

    private List<UUID> optionIds;
}
