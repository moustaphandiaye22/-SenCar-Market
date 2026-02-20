package com.sencarmarket.module.garage.controller;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.garage.dto.*;
import com.sencarmarket.module.garage.service.GarageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour la gestion des garages
 */
@RestController
@RequestMapping("/api/garages")
@RequiredArgsConstructor
@Slf4j
public class GarageController {

    private final GarageService garageService;

    // ========== GARAGE ==========

    /**
     * Créer un nouveau garage
     * POST /api/garages
     */
    @PostMapping
    public ResponseEntity<GarageResponse> createGarage(
            @Valid @RequestBody CreateGarageRequest request,
            @RequestHeader("X-User-Id") UUID proprietaireId) {
        log.info("POST /api/garages - Creating garage '{}' for user {}", request.getNom(), proprietaireId);
        GarageResponse response = garageService.createGarage(request, proprietaireId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtenir un garage par ID
     * GET /api/garages/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GarageResponse> getGarageById(@PathVariable UUID id) {
        log.debug("GET /api/garages/{}", id);
        return ResponseEntity.ok(garageService.getGarageById(id));
    }

    /**
     * Obtenir tous les garages (pagination)
     * GET /api/garages
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<GarageResponse>> getAllGarages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("GET /api/garages - page: {}, size: {}", page, size);
        return ResponseEntity.ok(garageService.getAllGarages(page, size));
    }

    /**
     * Obtenir les garages actifs
     * GET /api/garages/actifs
     */
    @GetMapping("/actifs")
    public ResponseEntity<PaginatedResponse<GarageResponse>> getActiveGarages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("GET /api/garages/actifs - page: {}, size: {}", page, size);
        return ResponseEntity.ok(garageService.getActiveGarages(page, size));
    }

    /**
     * Obtenir les garages en attente de validation (admin)
     * GET /api/garages/en-attente
     */
    @GetMapping("/en-attente")
    public ResponseEntity<PaginatedResponse<GarageResponse>> getGaragesEnAttente(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.debug("GET /api/garages/en-attente - page: {}, size: {}", page, size);
        return ResponseEntity.ok(garageService.getGaragesEnAttente(page, size));
    }

    /**
     * Obtenir les garages d'un propriétaire
     * GET /api/garages/proprietaire/{proprietaireId}
     */
    @GetMapping("/proprietaire/{proprietaireId}")
    public ResponseEntity<List<GarageResponse>> getGaragesByProprietaire(@PathVariable UUID proprietaireId) {
        log.debug("GET /api/garages/proprietaire/{}", proprietaireId);
        return ResponseEntity.ok(garageService.getGaragesByProprietaire(proprietaireId));
    }

    /**
     * Rechercher des garages par ville
     * GET /api/garages/search/ville
     */
    @GetMapping("/search/ville")
    public ResponseEntity<List<GarageResponse>> searchByVille(@RequestParam String ville) {
        log.debug("GET /api/garages/search/ville?ville={}", ville);
        return ResponseEntity.ok(garageService.searchByLocalisation(ville));
    }

    /**
     * Rechercher des garages par proximité
     * GET /api/garages/search/proximity
     */
    @GetMapping("/search/proximity")
    public ResponseEntity<List<GarageResponse>> searchByProximity(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") Double rayonKm) {
        log.debug("GET /api/garages/search/proximity?lat={}&lon={}&rayon={}", latitude, longitude, rayonKm);
        return ResponseEntity.ok(garageService.searchByProximity(latitude, longitude, rayonKm));
    }

    /**
     * Rechercher des garages
     * GET /api/garages/search
     */
    @GetMapping("/search")
    public ResponseEntity<List<GarageResponse>> searchGarages(@RequestParam String q) {
        log.debug("GET /api/garages/search?q={}", q);
        return ResponseEntity.ok(garageService.searchGarages(q));
    }

    /**
     * Mettre à jour un garage
     * PUT /api/garages/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<GarageResponse> updateGarage(
            @PathVariable UUID id,
            @Valid @RequestBody CreateGarageRequest request) {
        log.info("PUT /api/garages/{}", id);
        return ResponseEntity.ok(garageService.updateGarage(id, request));
    }

    /**
     * Supprimer un garage
     * DELETE /api/garages/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGarage(@PathVariable UUID id) {
        log.info("DELETE /api/garages/{}", id);
        garageService.deleteGarage(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Valider un garage (admin)
     * POST /api/garages/{id}/validate
     */
    @PostMapping("/{id}/validate")
    public ResponseEntity<GarageResponse> validerGarage(
            @PathVariable UUID id,
            @Valid @RequestBody ValidationGarageRequest request) {
        log.info("POST /api/garages/{}/validate", id);
        return ResponseEntity.ok(garageService.validerGarage(id, request));
    }

    /**
     * Mettre à jour le logo
     * PUT /api/garages/{id}/logo
     */
    @PutMapping("/{id}/logo")
    public ResponseEntity<GarageResponse> updateLogo(
            @PathVariable UUID id,
            @RequestBody String logoUrl) {
        log.info("PUT /api/garages/{}/logo", id);
        return ResponseEntity.ok(garageService.updateLogo(id, logoUrl));
    }

    // ========== SERVICES GARAGE ==========

    /**
     * Créer un service
     * POST /api/garages/services
     */
    @PostMapping("/services")
    public ResponseEntity<ServiceGarageResponse> createService(@Valid @RequestBody CreateServiceGarageRequest request) {
        log.info("POST /api/garages/services - Creating service '{}'", request.getNom());
        return ResponseEntity.status(HttpStatus.CREATED).body(garageService.createService(request));
    }

    /**
     * Obtenir tous les services
     * GET /api/garages/services
     */
    @GetMapping("/services")
    public ResponseEntity<List<ServiceGarageResponse>> getAllServices() {
        log.debug("GET /api/garages/services");
        return ResponseEntity.ok(garageService.getAllServices());
    }

    /**
     * Obtenir un service par ID
     * GET /api/garages/services/{id}
     */
    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceGarageResponse> getServiceById(@PathVariable UUID id) {
        log.debug("GET /api/garages/services/{}", id);
        return ResponseEntity.ok(garageService.getServiceById(id));
    }

    /**
     * Mettre à jour un service
     * PUT /api/garages/services/{id}
     */
    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceGarageResponse> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody CreateServiceGarageRequest request) {
        log.info("PUT /api/garages/services/{}", id);
        return ResponseEntity.ok(garageService.updateService(id, request));
    }

    /**
     * Supprimer un service
     * DELETE /api/garages/services/{id}
     */
    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        log.info("DELETE /api/garages/services/{}", id);
        garageService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // ========== ASSOCIATIONS GARAGE-SERVICE ==========

    /**
     * Associer un service à un garage
     * POST /api/garages/{garageId}/services
     */
    @PostMapping("/{garageId}/services")
    public ResponseEntity<GarageServiceResponse> associateService(
            @PathVariable UUID garageId,
            @Valid @RequestBody AssociateServiceRequest request) {
        log.info("POST /api/garages/{}/services - Associating service", garageId);
        request.setGarageId(garageId);
        return ResponseEntity.status(HttpStatus.CREATED).body(garageService.associateService(request));
    }

    /**
     * Obtenir les services d'un garage
     * GET /api/garages/{garageId}/services
     */
    @GetMapping("/{garageId}/services")
    public ResponseEntity<List<GarageServiceResponse>> getServicesByGarage(@PathVariable UUID garageId) {
        log.debug("GET /api/garages/{}/services", garageId);
        return ResponseEntity.ok(garageService.getServicesByGarage(garageId));
    }

    /**
     * Supprimer l'association service-garage
     * DELETE /api/garages/{garageId}/services/{serviceId}
     */
    @DeleteMapping("/{garageId}/services/{serviceId}")
    public ResponseEntity<Void> disassociateService(
            @PathVariable UUID garageId,
            @PathVariable UUID serviceId) {
        log.info("DELETE /api/garages/{}/services/{}", garageId, serviceId);
        garageService.disassociateService(garageId, serviceId);
        return ResponseEntity.noContent().build();
    }
}
