package com.sencarmarket.module.vehicule.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.vehicule.dto.CreateVehiculeRequest;
import com.sencarmarket.module.vehicule.dto.VehiculeFilter;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service véhicule
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IVehiculeService {

    VehiculeResponse createVehicule(CreateVehiculeRequest request, String userEmail);

    PaginatedResponse<VehiculeResponse> searchVehicules(VehiculeFilter filter);

    VehiculeResponse getVehiculeById(UUID id);

    List<VehiculeResponse> getMesVehicules(String userEmail);

    VehiculeResponse publishVehicule(UUID id);

    void deleteVehicule(UUID id);

    void addToFavoris(UUID vehiculeId, String userEmail);

    void removeFromFavoris(UUID vehiculeId, String userEmail);

    List<VehiculeResponse> getMesFavoris(String userEmail);

    VehiculeResponse boostVehicule(UUID vehiculeId, LocalDateTime debut, LocalDateTime fin);
}
