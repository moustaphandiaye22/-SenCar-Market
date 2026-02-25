package com.sencarmarket.module.garage.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.commun.service.PaginationService;
import com.sencarmarket.module.garage.dto.*;
import com.sencarmarket.module.garage.entity.Garage;
import com.sencarmarket.module.garage.entity.GarageServiceAssociation;
import com.sencarmarket.module.garage.entity.ServiceGarage;
import com.sencarmarket.module.garage.repository.GarageRepository;
import com.sencarmarket.module.garage.repository.GarageServiceRepository;
import com.sencarmarket.module.garage.repository.ServiceGarageRepository;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service Garage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GarageServiceImpl implements GarageService {
    private static final String RESOURCE_UTILISATEUR = "Utilisateur";
    private static final String RESOURCE_GARAGE = "Garage";
    private static final String RESOURCE_SERVICE = "Service";
    private static final String RESOURCE_ASSOCIATION = "Association";
    private static final String FIELD_ID = "id";

    private final GarageRepository garageRepository;
    private final ServiceGarageRepository serviceGarageRepository;
    private final GarageServiceRepository garageServiceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final GarageRulesService garageRulesService;
    private final PaginationService paginationService;

    // ========== GARAGE ==========

    @Override
    @Transactional
    public GarageResponse createGarage(CreateGarageRequest request, UUID proprietaireId) {
        log.info("Creating garage '{}' for user {}", request.getNom(), proprietaireId);

        Utilisateur proprietaire = utilisateurRepository.findById(proprietaireId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_UTILISATEUR, FIELD_ID, proprietaireId));

        Garage garage = Garage.builder()
                .nom(request.getNom())
                .adresse(request.getAdresse())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .description(request.getDescription())
                .horairesOuverture(request.getHorairesOuverture())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .ville(request.getVille())
                .pays(request.getPays())
                .logoUrl(request.getLogoUrl())
                .statutValidation(Garage.StatutValidation.EN_ATTENTE)
                .proprietaire(proprietaire)
                .build();

        garage = garageRepository.save(garage);
        log.info("Garage created with ID: {}", garage.getId());

        return GarageResponse.fromEntity(garage);
    }

    @Override
    @Transactional
    public GarageResponse updateGarage(UUID id, CreateGarageRequest request) {
        log.info("Updating garage {}", id);

        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_GARAGE, FIELD_ID, id));

        garage.setNom(request.getNom());
        garage.setAdresse(request.getAdresse());
        garage.setTelephone(request.getTelephone());
        garage.setEmail(request.getEmail());
        garage.setDescription(request.getDescription());
        garage.setHorairesOuverture(request.getHorairesOuverture());
        garage.setLatitude(request.getLatitude());
        garage.setLongitude(request.getLongitude());
        garage.setVille(request.getVille());
        garage.setPays(request.getPays());

        garage = garageRepository.save(garage);
        log.info("Garage {} updated", id);

        return GarageResponse.fromEntity(garage);
    }

    @Override
    @Transactional
    public void deleteGarage(UUID id) {
        log.info("Deleting garage {}", id);

        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_GARAGE, FIELD_ID, id));

        List<GarageServiceAssociation> associations = garageServiceRepository.findByGarageId(id);
        garageServiceRepository.deleteAll(associations);

        garageRepository.delete(garage);
        log.info("Garage {} deleted", id);
    }

    @Override
    public GarageResponse getGarageById(UUID id) {
        log.debug("Fetching garage by ID: {}", id);
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_GARAGE, FIELD_ID, id));
        return GarageResponse.fromEntity(garage);
    }

    @Override
    public PaginatedResponse<GarageResponse> getAllGarages(int page, int size) {
        log.debug("Fetching all garages - page: {}, size: {}", page, size);
        Page<Garage> garagePage = garageRepository.findAll(PageRequest.of(page, size));
        return paginationService.build(garagePage, garagePage.getContent().stream()
                .map(GarageResponse::fromEntity).collect(Collectors.toList()));
    }

    @Override
    public PaginatedResponse<GarageResponse> getActiveGarages(int page, int size) {
        log.debug("Fetching active garages - page: {}, size: {}", page, size);
        Page<Garage> garagePage = garageRepository
                .findByStatutValidationEquals(Garage.StatutValidation.ACTIF, PageRequest.of(page, size));
        return paginationService.build(garagePage, garagePage.getContent().stream()
                .map(GarageResponse::fromEntity).collect(Collectors.toList()));
    }

    @Override
    public PaginatedResponse<GarageResponse> getGaragesEnAttente(int page, int size) {
        log.debug("Fetching garages en attente - page: {}, size: {}", page, size);
        Page<Garage> garagePage = garageRepository
                .findByStatutValidation(Garage.StatutValidation.EN_ATTENTE, PageRequest.of(page, size));
        return paginationService.build(garagePage, garagePage.getContent().stream()
                .map(GarageResponse::fromEntity).collect(Collectors.toList()));
    }

    @Override
    public List<GarageResponse> getGaragesByProprietaire(UUID proprietaireId) {
        log.debug("Fetching garages for owner: {}", proprietaireId);
        return garageRepository.findByProprietaireId(proprietaireId).stream()
                .map(GarageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<GarageResponse> searchByLocalisation(String ville) {
        log.debug("Searching garages by ville: {}", ville);
        return garageRepository.findActiveByVille(ville).stream()
                .map(GarageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<GarageResponse> searchByProximity(Double latitude, Double longitude, Double rayonKm) {
        log.debug("Searching garages near ({}, {}) within {} km", latitude, longitude, rayonKm);
        double[] bounds = garageRulesService.calculateSearchBounds(latitude, longitude, rayonKm);

        return garageRepository.findByLocation(
                bounds[0], bounds[1],
                bounds[2], bounds[3]
        ).stream().map(GarageResponse::fromEntity).collect(Collectors.toList());
    }

    @Override
    public List<GarageResponse> searchGarages(String query) {
        log.debug("Searching garages with query: {}", query);
        return garageRepository.search(query).stream()
                .map(GarageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GarageResponse validerGarage(UUID id, ValidationGarageRequest request) {
        log.info("Validating garage {} with status {}", id, request.getNouveauStatut());

        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_GARAGE, FIELD_ID, id));

        garageRulesService.validateStatutTransition(garage.getStatutValidation(), request.getNouveauStatut());

        garage.setStatutValidation(request.getNouveauStatut());
        garage.setCommentaireAdmin(request.getCommentaireAdmin());
        garage.setDateValidation(LocalDateTime.now());

        garage = garageRepository.save(garage);
        log.info("Garage {} validated with status {}", id, request.getNouveauStatut());

        return GarageResponse.fromEntity(garage);
    }

    @Override
    @Transactional
    public GarageResponse updateLogo(UUID id, String logoUrl) {
        log.info("Updating logo for garage {}", id);

        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_GARAGE, FIELD_ID, id));

        garage.setLogoUrl(logoUrl);
        garage = garageRepository.save(garage);

        return GarageResponse.fromEntity(garage);
    }

    // ========== SERVICE GARAGE ==========

    @Override
    @Transactional
    public ServiceGarageResponse createService(CreateServiceGarageRequest request) {
        log.info("Creating service '{}'", request.getNom());

        ServiceGarage service = ServiceGarage.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .prix(request.getPrix())
                .dureeEstimee(request.getDureeEstimee())
                .categorie(request.getCategorie())
                .actif(true)
                .build();

        service = serviceGarageRepository.save(service);
        log.info("Service created with ID: {}", service.getId());

        return ServiceGarageResponse.fromEntity(service);
    }

    @Override
    @Transactional
    public ServiceGarageResponse updateService(UUID id, CreateServiceGarageRequest request) {
        log.info("Updating service {}", id);

        ServiceGarage service = serviceGarageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_SERVICE, FIELD_ID, id));

        service.setNom(request.getNom());
        service.setDescription(request.getDescription());
        service.setPrix(request.getPrix());
        service.setDureeEstimee(request.getDureeEstimee());
        service.setCategorie(request.getCategorie());

        service = serviceGarageRepository.save(service);
        return ServiceGarageResponse.fromEntity(service);
    }

    @Override
    @Transactional
    public void deleteService(UUID id) {
        log.info("Deleting service {}", id);

        ServiceGarage service = serviceGarageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_SERVICE, FIELD_ID, id));

        List<GarageServiceAssociation> associations = garageServiceRepository.findByServiceId(id);
        garageServiceRepository.deleteAll(associations);

        serviceGarageRepository.delete(service);
    }

    @Override
    public ServiceGarageResponse getServiceById(UUID id) {
        ServiceGarage service = serviceGarageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_SERVICE, FIELD_ID, id));
        return ServiceGarageResponse.fromEntity(service);
    }

    @Override
    public List<ServiceGarageResponse> getAllServices() {
        return serviceGarageRepository.findByActifTrue().stream()
                .map(ServiceGarageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceGarageResponse> getServicesByCategorie(String categorie) {
        return serviceGarageRepository.findByNomContainingIgnoreCase(categorie).stream()
                .map(ServiceGarageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ========== GARAGE-SERVICE (ASSOCIATION) ==========

    @Override
    @Transactional
    public GarageServiceResponse associateService(AssociateServiceRequest request) {
        log.info("Associating service {} to garage {}", request.getServiceId(), request.getGarageId());

        Garage garage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_GARAGE, FIELD_ID, request.getGarageId()));

        ServiceGarage service = serviceGarageRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_SERVICE, FIELD_ID, request.getServiceId()));

        garageServiceRepository.findByGarageIdAndServiceId(request.getGarageId(), request.getServiceId())
                .ifPresent(gs -> {
                    throw new InvalidOperationException(AppMessages.GARAGE_SERVICE_ALREADY_ASSOCIATED);
                });

        GarageServiceAssociation garageService = GarageServiceAssociation.builder()
                .garage(garage)
                .service(service)
                .prix(request.getPrix() != null ? request.getPrix() : service.getPrix())
                .dureeEstimee(request.getDureeEstimee() != null ? request.getDureeEstimee() : service.getDureeEstimee())
                .actif(true)
                .build();

        garageService = garageServiceRepository.save(garageService);
        log.info("Service {} associated to garage {}", request.getServiceId(), request.getGarageId());

        return GarageServiceResponse.fromEntity(garageService);
    }

    @Override
    @Transactional
    public GarageServiceResponse updateAssociation(UUID id, AssociateServiceRequest request) {
        log.info("Updating association {}", id);

        GarageServiceAssociation garageService = garageServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ASSOCIATION, FIELD_ID, id));

        garageService.setPrix(request.getPrix());
        garageService.setDureeEstimee(request.getDureeEstimee());

        garageService = garageServiceRepository.save(garageService);
        return GarageServiceResponse.fromEntity(garageService);
    }

    @Override
    @Transactional
    public void disassociateService(UUID garageId, UUID serviceId) {
        log.info("Disassociating service {} from garage {}", serviceId, garageId);

        GarageServiceAssociation garageService = garageServiceRepository.findByGarageIdAndServiceId(garageId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        RESOURCE_ASSOCIATION, "garageId/serviceId", garageId + "/" + serviceId));

        garageServiceRepository.delete(garageService);
    }

    @Override
    public List<GarageServiceResponse> getServicesByGarage(UUID garageId) {
        return garageServiceRepository.findByGarageIdAndActifTrue(garageId).stream()
                .map(GarageServiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<GarageServiceResponse> getGaragesByService(UUID serviceId) {
        return garageServiceRepository.findByServiceId(serviceId).stream()
                .map(GarageServiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

}
