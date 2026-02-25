package com.sencarmarket.module.paiement.dto;

import com.sencarmarket.module.paiement.enums.TypePaiement;
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
public class CreatePaiementRequest {

    private UUID utilisateurId;

    @NotNull(message = "L'ID de la réservation est requis")
    private UUID reservationId;

    @NotNull(message = "Le montant est requis")
    @Positive(message = "Le montant doit être positif")
    private BigDecimal montant;

    @NotNull(message = "La méthode de paiement est requise")
    private TypePaiement methodePaiement;

    private String description;

    // Pour paiement Orange Money
    private String telephone;

    // Pour escrow
    private Boolean isEscrow;
    private BigDecimal commissionEscrow;
}
