package com.sencarmarket.module.vehicule.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.dto.CreateVehiculeRequest;
import com.sencarmarket.module.vehicule.dto.VehiculeFilter;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.entity.*;
import com.sencarmarket.module.vehicule.repository.*;
import lombok.RequiredArgsConstructor;
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
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final MarqueRepository marqueRepository;
    private final ModeleRepository modeleRepository;
    private final CarburantRepository carburantRepository;
    private final BoiteVitesseRepository boiteVitesseRepository;
    private final PhotoVehiculeRepository photoVehiculeRepository;
    private final VehiculeFavoriRepository vehiculeFavoriRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public VehiculeResponse createVehicule(CreateVehiculeRequest request, String userEmail) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Marque marque = marqueRepository.findById(request.getMarqueId())
                .orElseThrow(() -> new RuntimeException("Marque non trouvée"));

        Modele modele = modeleRepository.findById(request.getModeleId())
                .orElseThrow(() -> new RuntimeException("Modèle non trouvé"));

        Carburant carburant = carburantRepository.findById(request.getCarburantId())
                .orElseThrow(() -> new RuntimeException("Carburant non trouvé"));

        BoiteVitesse boiteVitesse = boiteVitesseRepository.findById(request.getBoiteVitesseId())
                .orElseThrow(() -> new RuntimeException("Boîte de vitesse non trouvée"));

        Statut statut = Boolean.TRUE.equals(request.getEnregistrerEnBrouillon()) 
                ? Statut.BROUILLON 
                : Statut.PUBLIE;

        Vehicule vehicule = Vehicule.builder()
                .vendeur(utilisateur)
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

        if (request.getPhotosUrls() != null && !request.getPhotosUrls().isEmpty()) {
            List<PhotoVehicule> photos = request.getPhotosUrls().stream()
                    .map(url -> PhotoVehicule.builder()
                            .vehicule(vehicule)
                            .url(url)
                            .build())
                    .collect(Collectors.toList());
            photoVehiculeRepository.saveAll(photos);
        }

        return mapToResponse(vehicule);
    }

    public PaginatedResponse<VehiculeResponse> searchVehicules(VehiculeFilter filter) {
        Sort sort = Sort.by(Sort.Direction.fromString(filter.getSortDir()), filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Vehicule> vehiculesPage = vehiculeRepository.findByStatut(Statut.PUBLIE, pageable);

        List<VehiculeResponse> responses = vehiculesPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

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
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        vehicule.setVues(vehicule.getVues() + 1);
        vehiculeRepository.save(vehicule);

        return mapToResponse(vehicule);
    }

    public List<VehiculeResponse> getMesVehicules(String userEmail) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return vehiculeRepository.findByVendeurId(utilisateur.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehiculeResponse publishVehicule(UUID id) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        vehicule.setStatut(Statut.PUBLIE);
        vehiculeRepository.save(vehicule);

        return mapToResponse(vehicule);
    }

    @Transactional
    public void deleteVehicule(UUID id) {
        vehiculeRepository.deleteById(id);
    }

    @Transactional
    public void addToFavoris(UUID vehiculeId, String userEmail) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        if (!vehiculeFavoriRepository.existsByUtilisateurIdAndVehiculeId(utilisateur.getId(), vehiculeId)) {
            VehiculeFavori favori = VehiculeFavori.builder()
                    .utilisateur(utilisateur)
                    .vehicule(vehicule)
                    .build();
            vehiculeFavoriRepository.save(favori);
        }
    }

    @Transactional
    public void removeFromFavoris(UUID vehiculeId, String userEmail) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        vehiculeFavoriRepository.deleteByUtilisateurIdAndVehiculeId(utilisateur.getId(), vehiculeId);
    }

    public List<VehiculeResponse> getMesFavoris(String userEmail) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return vehiculeFavoriRepository.findByUtilisateurId(utilisateur.getId()).stream()
                .map(favori -> mapToResponse(favori.getVehicule()))
                .collect(Collectors.toList());
    }

    @Transactional
    public VehiculeResponse boostVehicule(UUID vehiculeId, LocalDateTime debut, LocalDateTime fin) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        vehicule.setEstBoost(true);
        vehicule.setBoostDebut(debut);
        vehicule.setBoostFin(fin);
        vehiculeRepository.save(vehicule);

        return mapToResponse(vehicule);
    }

    private VehiculeResponse mapToResponse(Vehicule vehicule) {
        List<String> photos = photoVehiculeRepository.findByVehiculeId(vehicule.getId()).stream()
                .map(PhotoVehicule::getUrl)
                .collect(Collectors.toList());

        return VehiculeResponse.builder()
                .id(vehicule.getId())
                .marque(vehicule.getMarque() != null ? vehicule.getMarque().getNom() : null)
                .modele(vehicule.getModele() != null ? vehicule.getModele().getNom() : null)
                .anneeFabrication(vehicule.getAnneeFabrication())
                .kilometrage(vehicule.getKilometrage())
                .carburant(vehicule.getCarburant() != null ? vehicule.getCarburant().getNom() : null)
                .boiteVitesse(vehicule.getBoiteVitesse() != null ? vehicule.getBoiteVitesse().getNom() : null)
                .couleur(vehicule.getCouleur())
                .prixVente(vehicule.getPrixVente())
                .description(vehicule.getDescription())
                .numeroVin(vehicule.getNumeroVin())
                .immatriculation(vehicule.getImmatriculation())
                .statut(vehicule.getStatut() != null ? vehicule.getStatut().name() : null)
                .prixNegociable(vehicule.getPrixNegociable())
                .certifie(vehicule.getCertifie())
                .photosUrls(photos)
                .estBoost(vehicule.getEstBoost())
                .boostDebut(vehicule.getBoostDebut())
                .boostFin(vehicule.getBoostFin())
                .vues(vehicule.getVues())
                .createdAt(vehicule.getCreatedAt())
                .build();
    }
}
