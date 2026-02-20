package com.sencarmarket.module.garage.dto;

import com.sencarmarket.module.garage.entity.Garage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un garage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GarageResponse {

    private UUID id;
    private String nom;
    private String adresse;
    private String telephone;
    private String email;
    private String description;
    private String horairesOuverture;

    // Localisation
    private Double latitude;
    private Double longitude;
    private String ville;
    private String pays;

    // Logo
    private String logoUrl;

    // Validation
    private String statutValidation;
    private String commentaireAdmin;
    private LocalDateTime dateValidation;

    // Propriétaire
    private UUID proprietaireId;
    private String proprietaireNom;

    // Métadonnées
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Note moyenne (calculée depuis les avis)
    private Double noteMoyenne;
    private Integer nombreAvis;

    /**
     * Mapper depuis l'entité Garage
     */
    public static GarageResponse fromEntity(Garage garage) {
        return GarageResponse.builder()
                .id(garage.getId())
                .nom(garage.getNom())
                .adresse(garage.getAdresse())
                .telephone(garage.getTelephone())
                .email(garage.getEmail())
                .description(garage.getDescription())
                .horairesOuverture(garage.getHorairesOuverture())
                .latitude(garage.getLatitude())
                .longitude(garage.getLongitude())
                .ville(garage.getVille())
                .pays(garage.getPays())
                .logoUrl(garage.getLogoUrl())
                .statutValidation(garage.getStatutValidation() != null ? 
                        garage.getStatutValidation().name() : null)
                .commentaireAdmin(garage.getCommentaireAdmin())
                .dateValidation(garage.getDateValidation())
                .proprietaireId(garage.getProprietaire() != null ? 
                        garage.getProprietaire().getId() : null)
                .proprietaireNom(garage.getProprietaire() != null ? 
                        garage.getProprietaire().getNom() : null)
                .createdAt(garage.getCreatedAt())
                .updatedAt(garage.getUpdatedAt())
                .build();
    }
}
