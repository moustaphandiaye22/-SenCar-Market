package com.sencarmarket.module.garage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'un garage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGarageRequest {

    @NotBlank(message = "Le nom du garage est requis")
    private String nom;

    @NotBlank(message = "L'adresse est requise")
    private String adresse;

    @NotBlank(message = "Le téléphone est requis")
    private String telephone;

    @Email(message = "Email invalide")
    private String email;

    private String description;

    private String horairesOuverture;

    // Localisation
    private Double latitude;
    private Double longitude;

    @NotBlank(message = "La ville est requise")
    private String ville;

    private String pays;

    // Logo (URL après upload)
    private String logoUrl;
}
