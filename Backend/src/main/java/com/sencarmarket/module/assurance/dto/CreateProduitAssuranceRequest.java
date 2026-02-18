package com.sencarmarket.module.assurance.dto;

import com.sencarmarket.module.assurance.enums.TypeAssurance;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProduitAssuranceRequest {

    @NotBlank(message = "Le nom est requis")
    private String nom;

    private String description;

    @NotNull(message = "Le prix de base est requis")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal prixBase;

    @NotNull(message = "Le type d'assurance est requis")
    private TypeAssurance typeAssurance;

    private Integer dureeMois;
}
