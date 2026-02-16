package com.sencarmarket.module.vehicule.mapper;

import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.entity.Vehicule;

import java.util.List;

/**
 * Interface pour le mapper Vehicule
 * Respecte le principe DIP (Dependency Inversion Principle) de SOLID
 */
public interface IVehiculeMapper {

    /**
     * Convertit une entité Vehicule en VehiculeResponse
     */
    VehiculeResponse toResponse(Vehicule vehicule);

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    List<VehiculeResponse> toResponseList(List<Vehicule> vehicules);
}
