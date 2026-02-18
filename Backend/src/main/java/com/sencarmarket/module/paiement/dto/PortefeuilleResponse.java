package com.sencarmarket.module.paiement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortefeuilleResponse {

    private UUID id;
    private UUID utilisateurId;
    private BigDecimal solde;
    private BigDecimal soldeBloque; // Pour escrow
    private BigDecimal soldeDisponible;
    private LocalDateTime dateDerniereRecharge;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
