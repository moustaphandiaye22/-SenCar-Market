package com.sencarmarket.module.assurance.dto;

import com.sencarmarket.module.assurance.enums.TypeAssurance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProduitAssuranceResponse {

    private UUID id;
    private String nom;
    private String description;
    private BigDecimal prixBase;
    private TypeAssurance typeAssurance;
    private Integer dureeMois;
    private Boolean estActif;
    private List<OptionAssuranceResponse> options;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
