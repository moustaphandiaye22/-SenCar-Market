package com.sencarmarket.module.paiement.dto;

import com.sencarmarket.module.paiement.enums.StatutPaiement;
import com.sencarmarket.module.paiement.enums.TypePaiement;
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
public class PaiementResponse {

    private UUID id;
    private UUID utilisateurId;
    private UUID reservationId;
    private BigDecimal montant;
    private BigDecimal montantEscrow;
    private BigDecimal commission;
    private StatutPaiement statut;
    private TypePaiement methodePaiement;
    private LocalDateTime datePaiement;
    private String referenceTransaction;
    private String referenceWave;
    private String referenceOM;
    private String urlPaiement;
    private Boolean isEscrow;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
