package com.sencarmarket.module.abonnement.dto;

import com.sencarmarket.module.abonnement.enums.TypeAbonnement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour créer un plan d'abonnement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAbonnementRequest {

    @NotBlank(message = "Le nom est requis")
    private String nom;

    private String description;

    @NotNull(message = "Le prix mensuel est requis")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal prixMensuel;

    @NotNull(message = "La durée en jours est requise")
    @Positive(message = "La durée doit être positive")
    private Integer dureeJours;

    @NotNull(message = "Le nombre d'annonces est requis")
    @Positive(message = "Le nombre d'annonces doit être positif")
    private Integer nombreAnnonces;

    private Boolean estVedette;

    private Boolean estCertifie;

    private TypeAbonnement type;
}
