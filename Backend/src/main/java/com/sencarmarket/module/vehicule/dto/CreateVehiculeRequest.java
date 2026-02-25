package com.sencarmarket.module.vehicule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVehiculeRequest {

    @NotNull(message = "La marque est obligatoire")
    private UUID marqueId;

    @NotNull(message = "Le modèle est obligatoire")
    private UUID modeleId;

    @NotNull(message = "L'année de fabrication est obligatoire")
    private Integer anneeFabrication;

    @NotNull(message = "Le kilométrage est obligatoire")
    @Positive(message = "Le kilométrage doit être positif")
    private Integer kilometrage;

    @NotNull(message = "Le type de carburant est obligatoire")
    private UUID carburantId;

    @NotNull(message = "La boîte de vitesse est obligatoire")
    private UUID boiteVitesseId;

    @NotBlank(message = "La couleur est obligatoire")
    private String couleur;

    @NotNull(message = "Le prix de vente est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal prixVente;

    private String description;

    @NotBlank(message = "Le numéro VIN est obligatoire")
    private String numeroVin;

    private String immatriculation;

    private Boolean prixNegociable;

    private Boolean certifie;

    private List<String> photosUrls;

    @Builder.Default
    private Boolean enregistrerEnBrouillon = false;
}
