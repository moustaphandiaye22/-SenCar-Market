package com.sencarmarket.module.annonce.dto;

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
public class AnnonceLocationResponse {

    private UUID id;
    private UUID vehiculeId;
    private String vehiculeMarque;
    private String vehiculeModele;
    private String vehiculePhoto;
    private UUID proprietaireId;
    private String proprietaireNom;
    private BigDecimal tarifJournalier;
    private String description;
    private String conditions;
    private BigDecimal caution;
    private Integer kilometrageInclus;
    private BigDecimal tarifKmSupplementaire;
    private String statut;
    private Boolean actif;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
