package com.sencarmarket.module.garage.dto;

import com.sencarmarket.module.garage.entity.ServiceGarage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un service garage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceGarageResponse {

    private UUID id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private Integer dureeEstimee;
    private String categorie;
    private Boolean actif;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Mapper depuis l'entité ServiceGarage
     */
    public static ServiceGarageResponse fromEntity(ServiceGarage service) {
        return ServiceGarageResponse.builder()
                .id(service.getId())
                .nom(service.getNom())
                .description(service.getDescription())
                .prix(service.getPrix())
                .dureeEstimee(service.getDureeEstimee())
                .categorie(service.getCategorie())
                .actif(service.getActif())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }
}
