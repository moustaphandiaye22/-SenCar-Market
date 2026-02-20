package com.sencarmarket.module.garage.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.garage.dto.*;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service garage
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface GarageService {

    // ========== GARAGE ==========

    /**
     * Créer un nouveau garage
     */
    GarageResponse createGarage(CreateGarageRequest request, UUID proprietaireId);

    /**
     * Mettre à jour un garage
     */
    GarageResponse updateGarage(UUID id, CreateGarageRequest request);

    /**
     * Supprimer un garage
     */
    void deleteGarage(UUID id);

    /**
     * Obtenir un garage par ID
     */
    GarageResponse getGarageById(UUID id);

    /**
     * Obtenir tous les garages avec pagination
     */
    PaginatedResponse<GarageResponse> getAllGarages(int page, int size);

    /**
     * Obtenir les garages actifs avec pagination
     */
    PaginatedResponse<GarageResponse> getActiveGarages(int page, int size);

    /**
     * Obtenir les garages en attente de validation
     */
    PaginatedResponse<GarageResponse> getGaragesEnAttente(int page, int size);

    /**
     * Obtenir les garages d'un propriétaire
     */
    List<GarageResponse> getGaragesByProprietaire(UUID proprietaireId);

    /**
     * Rechercher des garages par localisation
     */
    List<GarageResponse> searchByLocalisation(String ville);

    /**
     * Rechercher des garages par proximité
     */
    List<GarageResponse> searchByProximity(Double latitude, Double longitude, Double rayonKm);

    /**
     * Rechercher des garages
     */
    List<GarageResponse> searchGarages(String query);

    /**
     * Valider un garage (admin)
     */
    GarageResponse validerGarage(UUID id, ValidationGarageRequest request);

    /**
     * Mettre à jour le logo
     */
    GarageResponse updateLogo(UUID id, String logoUrl);

    // ========== SERVICE GARAGE ==========

    /**
     * Créer un service
     */
    ServiceGarageResponse createService(CreateServiceGarageRequest request);

    /**
     * Mettre à jour un service
     */
    ServiceGarageResponse updateService(UUID id, CreateServiceGarageRequest request);

    /**
     * Supprimer un service
     */
    void deleteService(UUID id);

    /**
     * Obtenir un service par ID
     */
    ServiceGarageResponse getServiceById(UUID id);

    /**
     * Obtenir tous les services
     */
    List<ServiceGarageResponse> getAllServices();

    /**
     * Obtenir les services par catégorie
     */
    List<ServiceGarageResponse> getServicesByCategorie(String categorie);

    // ========== GARAGE-SERVICE (ASSOCIATION) ==========

    /**
     * Associer un service à un garage
     */
    GarageServiceResponse associateService(AssociateServiceRequest request);

    /**
     * Mettre à jour l'association
     */
    GarageServiceResponse updateAssociation(UUID id, AssociateServiceRequest request);

    /**
     * Supprimer l'association
     */
    void disassociateService(UUID garageId, UUID serviceId);

    /**
     * Obtenir les services d'un garage
     */
    List<GarageServiceResponse> getServicesByGarage(UUID garageId);

    /**
     * Obtenir les garages proposant un service
     */
    List<GarageServiceResponse> getGaragesByService(UUID serviceId);
}
