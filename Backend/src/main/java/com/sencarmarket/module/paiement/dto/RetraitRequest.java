package com.sencarmarket.module.paiement.dto;

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
public class RetraitRequest {

    @NotNull(message = "Le montant est requis")
    @Positive(message = "Le montant doit être positif")
    private BigDecimal montant;

    @NotNull(message = "Le numéro de téléphone est requis")
    private String telephone;

    private String nomBeneficiaire;
    private String banque;
    private String numeroCompte;
}
