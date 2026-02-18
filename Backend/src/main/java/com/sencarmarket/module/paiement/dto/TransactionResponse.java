package com.sencarmarket.module.paiement.dto;

import com.sencarmarket.module.paiement.enums.StatutTransaction;
import com.sencarmarket.module.paiement.enums.TypeTransaction;
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
public class TransactionResponse {

    private UUID id;
    private UUID portefeuilleId;
    private BigDecimal montant;
    private TypeTransaction typeTransaction;
    private StatutTransaction statut;
    private String description;
    private String referenceExterne;
    private LocalDateTime dateTransaction;
    private LocalDateTime createdAt;
}
