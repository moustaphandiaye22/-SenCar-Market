package com.sencarmarket.module.vehicule.dto;

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
public class VehiculeFilter {
    private UUID marqueId;
    private UUID modeleId;
    private Integer anneeMin;
    private Integer anneeMax;
    private Integer kilometrageMin;
    private Integer kilometrageMax;
    private UUID carburantId;
    private UUID boiteVitesseId;
    private String couleur;
    private BigDecimal prixMin;
    private BigDecimal prixMax;
    private Boolean prixNegociable;
    private Boolean certifie;
    private String statut; // BROUILLON, PUBLIE, VENDU

    // Pagination
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 20;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDir = "DESC";
}
