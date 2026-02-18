package com.sencarmarket.module.paiement.dto;

import com.sencarmarket.module.paiement.enums.TypeTransaction;
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
public class TransactionPortefeuilleRequest {

    @NotNull(message = "Le montant est requis")
    @Positive(message = "Le montant doit être positif")
    private BigDecimal montant;

    @NotNull(message = "Le type de transaction est requis")
    private TypeTransaction typeTransaction;

    private String description;

    // Pour paiement mobile
    private String telephone;
    private String referencePaiement;
}
