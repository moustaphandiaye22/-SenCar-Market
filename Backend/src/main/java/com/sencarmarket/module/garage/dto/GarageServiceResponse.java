package com.sencarmarket.module.garage.dto;

import com.sencarmarket.module.garage.entity.GarageServiceAssociation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse de l'association garage-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GarageServiceResponse {

    private UUID id;
    private UUID garageId;
    private String garageNom;
    private UUID serviceId;
    private String serviceNom;
    private BigDecimal prix;
    private Integer dureeEstimee;
    private Boolean actif;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Mapper depuis l'entité GarageServiceAssociation
     */
    public static GarageServiceResponse fromEntity(GarageServiceAssociation garageService) {
        return GarageServiceResponse.builder()
                .id(garageService.getId())
                .garageId(garageService.getGarage() != null ? garageService.getGarage().getId() : null)
                .garageNom(garageService.getGarage() != null ? garageService.getGarage().getNom() : null)
                .serviceId(garageService.getService() != null ? garageService.getService().getId() : null)
                .serviceNom(garageService.getService() != null ? garageService.getService().getNom() : null)
                .prix(garageService.getPrix())
                .dureeEstimee(garageService.getDureeEstimee())
                .actif(garageService.getActif())
                .createdAt(garageService.getCreatedAt())
                .updatedAt(garageService.getUpdatedAt())
                .build();
    }
}
