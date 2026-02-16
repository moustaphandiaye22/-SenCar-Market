package com.sencarmarket.module.vehicule.mapper;

import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.PhotoVehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour convertir les entités Vehicule en DTOs
 * Respecte le principe SRP en centralisant la logique de mapping
 */
@Component
@RequiredArgsConstructor
public class VehiculeMapper implements IVehiculeMapper {

    private final PhotoVehiculeRepository photoVehiculeRepository;

    /**
     * Convertit une entité Vehicule en VehiculeResponse
     */
    public VehiculeResponse toResponse(Vehicule vehicule) {
        if (vehicule == null) {
            return null;
        }

        List<String> photos = photoVehiculeRepository.findByVehiculeId(vehicule.getId()).stream()
                .map(photo -> photo.getUrl())
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

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    public List<VehiculeResponse> toResponseList(List<Vehicule> vehicules) {
        if (vehicules == null) {
            return null;
        }
        return vehicules.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
