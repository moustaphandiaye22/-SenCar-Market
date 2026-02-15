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
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDir = "DESC";
}
