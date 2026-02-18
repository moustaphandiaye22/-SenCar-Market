package com.sencarmarket.module.assurance.dto;

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
public class OptionAssuranceResponse {

    private UUID id;
    private String nom;
    private String description;
    private BigDecimal prixSupplementaire;
    private UUID produitAssuranceId;
    private Boolean estActif;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
