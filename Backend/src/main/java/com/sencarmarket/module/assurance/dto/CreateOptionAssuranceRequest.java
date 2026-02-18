package com.sencarmarket.module.assurance.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CreateOptionAssuranceRequest {

    @NotBlank(message = "Le nom est requis")
    private String nom;

    private String description;

    @NotNull(message = "Le prix est requis")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal prixSupplementaire;

    @NotNull(message = "L'ID du produit d'assurance est requis")
    private UUID produitAssuranceId;
}
