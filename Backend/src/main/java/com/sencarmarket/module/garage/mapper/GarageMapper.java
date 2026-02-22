package com.sencarmarket.module.garage.mapper;

import com.sencarmarket.module.garage.dto.GarageResponse;
import com.sencarmarket.module.garage.dto.GarageServiceResponse;
import com.sencarmarket.module.garage.dto.ServiceGarageResponse;
import com.sencarmarket.module.garage.entity.Garage;
import com.sencarmarket.module.garage.entity.GarageServiceAssociation;
import com.sencarmarket.module.garage.entity.ServiceGarage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités et DTOs du module Garage
 * Suit le principe DRY en centralisant les conversions
 */
@Component
public class GarageMapper {

    /**
     * Convertit une entité Garage en GarageResponse
     */
    public GarageResponse toGarageResponse(Garage garage) {
        if (garage == null) {
            return null;
        }
        return GarageResponse.fromEntity(garage);
    }

    /**
     * Convertit une liste d'entités Garage en liste de GarageResponse
     */
    public List<GarageResponse> toGarageResponseList(List<Garage> garages) {
        if (garages == null) {
            return null;
        }
        return garages.stream()
                .map(this::toGarageResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité ServiceGarage en ServiceGarageResponse
     */
    public ServiceGarageResponse toServiceGarageResponse(ServiceGarage service) {
        if (service == null) {
            return null;
        }
        return ServiceGarageResponse.fromEntity(service);
    }

    /**
     * Convertit une liste d'entités ServiceGarage en liste de ServiceGarageResponse
     */
    public List<ServiceGarageResponse> toServiceGarageResponseList(List<ServiceGarage> services) {
        if (services == null) {
            return null;
        }
        return services.stream()
                .map(this::toServiceGarageResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité GarageServiceAssociation en GarageServiceResponse
     */
    public GarageServiceResponse toGarageServiceResponse(GarageServiceAssociation garageService) {
        if (garageService == null) {
            return null;
        }
        return GarageServiceResponse.fromEntity(garageService);
    }

    /**
     * Convertit une liste d'entités GarageServiceAssociation en liste de GarageServiceResponse
     */
    public List<GarageServiceResponse> toGarageServiceResponseList(List<GarageServiceAssociation> garageServices) {
        if (garageServices == null) {
            return null;
        }
        return garageServices.stream()
                .map(this::toGarageServiceResponse)
                .collect(Collectors.toList());
    }
}
