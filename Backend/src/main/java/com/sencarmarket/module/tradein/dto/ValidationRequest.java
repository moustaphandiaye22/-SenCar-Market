package com.sencarmarket.module.tradein.dto;

import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRequest {

    @NotNull(message = "Le nouveau statut est requis")
    private StatutTradeIn nouveauStatut;

    private BigDecimal prixPropose;

    private String commentaireAdmin;

    private String motifRejet;
}
