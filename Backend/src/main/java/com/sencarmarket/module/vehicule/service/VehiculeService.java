package com.sencarmarket.module.vehicule.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.dto.CreateVehiculeRequest;
import com.sencarmarket.module.vehicule.dto.VehiculeFilter;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.entity.*;
import com.sencarmarket.module.vehicule.mapper.IVehiculeMapper;
import com.sencarmarket.module.vehicule.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehiculeService implements IVehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final MarqueRepository marqueRepository;
    private final ModeleRepository modeleRepository;
    private final CarburantRepository carburantRepository;
    private final BoiteVitesseRepository boiteVitesseRepository;
    private final PhotoVehiculeRepository photoVehiculeRepository;
    private final VehiculeFavoriRepository vehiculeFavoriRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final IVehiculeMapper vehiculeMapper;

    @Transactional
    public VehiculeResponse createVehicule(CreateVehiculeRequest request, String userEmail) {
        log.info("Création d'un nouveau véhicule pour l'utilisateur: {}", userEmail);
        
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        Marque marque = marqueRepository.findById(request.getMarqueId())
                .orElseThrow(() -> new ResourceNotFoundException("Marque", "id", request.getMarqueId()));

        Modele modele = modeleRepository.findById(request.getModeleId())
                .orElseThrow(() -> new ResourceNotFoundException("Modèle", "id", request.getModeleId()));

        Carburant carburant = carburantRepository.findById(request.getCarburantId())
                .orElseThrow(() -> new ResourceNotFoundException("Carburant", "id", request.getCarburantId()));

        BoiteVitesse boiteVitesse = boiteVitesseRepository.findById(request.getBoiteVitesseId())
                .orElseThrow(() -> new ResourceNotFoundException("Boîte de vitesse", "id", request.getBoiteVitesseId()));

        Statut statut = Boolean.TRUE.equals(request.getEnregistrerEnBrouillon()) 
                ? Statut.BROUILLON 
                : Statut.PUBLIE;

        Vehicule vehicule = Vehicule.builder()
                .proprietaire(utilisateur)
                .marque(marque)
                .modele(modele)
                .anneeFabrication(request.getAnneeFabrication())
                .kilometrage(request.getKilometrage())
                .carburant(carburant)
                .boiteVitesse(boiteVitesse)
                .couleur(request.getCouleur())
                .prixVente(request.getPrixVente())
                .description(request.getDescription())
                .numeroVin(request.getNumeroVin())
                .immatriculation(request.getImmatriculation())
                .prixNegociable(request.getPrixNegociable())
                .certifie(request.getCertifie())
                .statut(statut)
                .estBoost(false)
                .vues(0)
                .build();

        vehiculeRepository.save(vehicule);
        log.info("Véhicule créé avec succès: ID={}", vehicule.getId());

        if (request.getPhotosUrls() != null && !request.getPhotosUrls().isEmpty()) {
            List<PhotoVehicule> photos = request.getPhotosUrls().stream()
                    .map(url -> PhotoVehicule.builder()
                            .vehicule(vehicule)
                            .url(url)
                            .build())
                    .collect(Collectors.toList());
            photoVehiculeRepository.saveAll(photos);
        }

        return vehiculeMapper.toResponse(vehicule);
    }

    public PaginatedResponse<VehiculeResponse> searchVehicules(VehiculeFilter filter) {
        log.debug("Recherche de véhicules avec les filtres: {}", filter);
        Sort sort = Sort.by(Sort.Direction.fromString(filter.getSortDir()), filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Vehicule> vehiculesPage = vehiculeRepository.findByStatut(Statut.PUBLIE, pageable);

        List<VehiculeResponse> responses = vehiculeMapper.toResponseList(vehiculesPage.getContent());

        return PaginatedResponse.<VehiculeResponse>builder()
                .content(responses)
                .page(vehiculesPage.getNumber())
                .size(vehiculesPage.getSize())
                .totalElements(vehiculesPage.getTotalElements())
                .totalPages(vehiculesPage.getTotalPages())
                .last(vehiculesPage.isLast())
                .first(vehiculesPage.isFirst())
                .build();
    }

    public VehiculeResponse getVehiculeById(UUID id) {
        log.debug("Récupération du véhicule par ID: {}", id);
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));

        vehicule.setVues(vehicule.getVues() + 1);
        vehiculeRepository.save(vehicule);
        log.info("Nombre de vues incrémenté pour le véhicule: {}", id);

        return vehiculeMapper.toResponse(vehicule);
    }

    public List<VehiculeResponse> getMesVehicules(String userEmail) {
        log.debug("Récupération des véhicules de l'utilisateur: {}", userEmail);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        return vehiculeMapper.toResponseList(vehiculeRepository.findByProprietaireId(utilisateur.getId()));
    }

    @Transactional
    public VehiculeResponse publishVehicule(UUID id) {
        log.info("Publication du véhicule: {}", id);
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));

        vehicule.setStatut(Statut.PUBLIE);
        vehiculeRepository.save(vehicule);
        log.info("Véhicule publié avec succès: {}", id);

        return vehiculeMapper.toResponse(vehicule);
    }

    @Transactional
    public void deleteVehicule(UUID id) {
        log.info("Suppression du véhicule: {}", id);
        vehiculeRepository.deleteById(id);
        log.info("Véhicule supprimé avec succès: {}", id);
    }

    @Transactional
    public void addToFavoris(UUID vehiculeId, String userEmail) {
        log.info("Ajout aux favoris - Véhicule: {}, Utilisateur: {}", vehiculeId, userEmail);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", vehiculeId));

        if (!vehiculeFavoriRepository.existsByUtilisateurIdAndVehiculeId(utilisateur.getId(), vehiculeId)) {
            VehiculeFavori favori = VehiculeFavori.builder()
                    .utilisateur(utilisateur)
                    .vehicule(vehicule)
                    .build();
            vehiculeFavoriRepository.save(favori);
            log.info("Véhicule ajouté aux favoris avec succès");
        }
    }

    @Transactional
    public void removeFromFavoris(UUID vehiculeId, String userEmail) {
        log.info("Suppression des favoris - Véhicule: {}, Utilisateur: {}", vehiculeId, userEmail);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        vehiculeFavoriRepository.deleteByUtilisateurIdAndVehiculeId(utilisateur.getId(), vehiculeId);
        log.info("Véhicule supprimé des favoris avec succès");
    }

    public List<VehiculeResponse> getMesFavoris(String userEmail) {
        log.debug("Récupération des favoris pour l'utilisateur: {}", userEmail);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        return vehiculeFavoriRepository.findByUtilisateurId(utilisateur.getId()).stream()
                .map(favori -> vehiculeMapper.toResponse(favori.getVehicule()))
                .collect(Collectors.toList());
    }

    @Transactional
    public VehiculeResponse boostVehicule(UUID vehiculeId, LocalDateTime debut, LocalDateTime fin) {
        log.info("Activation du boost pour le véhicule: {}", vehiculeId);
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", vehiculeId));

        vehicule.setEstBoost(true);
        vehicule.setBoostDebut(debut);
        vehicule.setBoostFin(fin);
        vehiculeRepository.save(vehicule);
        log.info("Boost activé avec succès pour le véhicule: {}", vehiculeId);

        return vehiculeMapper.toResponse(vehicule);
    }
}
