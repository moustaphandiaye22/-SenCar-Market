package com.sencarmarket.module.tradein.dto;

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
public class EstimationResponse {

    private UUID vehiculeId;
    private String vehiculeDescription;
    private BigDecimal prixEstime;
    private BigDecimal prixMinimum;
    private BigDecimal prixMaximum;
    private Integer kilometrage;
    private String etatVehicule;
    private Double scoreCondition;
    private String recommandation;
}
