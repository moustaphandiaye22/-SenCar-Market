package com.sencarmarket.module.annonce.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnnonceLocationRequest {

    @NotNull(message = "L'ID du véhicule est requis")
    private UUID vehiculeId;

    @NotNull(message = "Le tarif journalier est requis")
    @Positive(message = "Le tarif journalier doit être positif")
    private BigDecimal tarifJournalier;

    private String description;

    private String conditions;

    private BigDecimal caution;

    private Integer kilometrageInclus;

    private BigDecimal tarifKmSupplementaire;
}
