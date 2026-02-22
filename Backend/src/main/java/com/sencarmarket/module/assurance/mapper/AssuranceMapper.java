package com.sencarmarket.module.assurance.mapper;

import com.sencarmarket.module.assurance.dto.OptionAssuranceResponse;
import com.sencarmarket.module.assurance.dto.ProduitAssuranceResponse;
import com.sencarmarket.module.assurance.dto.SouscriptionAssuranceResponse;
import com.sencarmarket.module.assurance.entity.OptionAssurance;
import com.sencarmarket.module.assurance.entity.ProduitAssurance;
import com.sencarmarket.module.assurance.entity.SouscriptionAssurance;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités et DTOs du module Assurance
 * Suit le principe DRY en centralisant les conversions
 */
@Component
public class AssuranceMapper {

    /**
     * Convertit une entité ProduitAssurance en ProduitAssuranceResponse
     */
    public ProduitAssuranceResponse toProduitAssuranceResponse(ProduitAssurance produit) {
        if (produit == null) {
            return null;
        }
        return ProduitAssuranceResponse.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .prixBase(produit.getPrixBase())
                .typeAssurance(produit.getTypeAssurance())
                .dureeMois(produit.getDureeMois())
                .estActif(produit.getEstActif())
                .options(toOptionAssuranceResponseList(produit.getOptions()))
                .createdAt(produit.getCreatedAt())
                .updatedAt(produit.getUpdatedAt())
                .build();
    }

    /**
     * Convertit une liste d'entités ProduitAssurance en liste de ProduitAssuranceResponse
     */
    public List<ProduitAssuranceResponse> toProduitAssuranceResponseList(List<ProduitAssurance> produits) {
        if (produits == null) {
            return null;
        }
        return produits.stream()
                .map(this::toProduitAssuranceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité OptionAssurance en OptionAssuranceResponse
     */
    public OptionAssuranceResponse toOptionAssuranceResponse(OptionAssurance option) {
        if (option == null) {
            return null;
        }
        return OptionAssuranceResponse.builder()
                .id(option.getId())
                .nom(option.getNom())
                .description(option.getDescription())
                .prixSupplementaire(option.getPrixSupplementaire())
                .produitAssuranceId(option.getProduitAssurance() != null ? option.getProduitAssurance().getId() : null)
                .estActif(option.getEstActif())
                .createdAt(option.getCreatedAt())
                .updatedAt(option.getUpdatedAt())
                .build();
    }

    /**
     * Convertit une liste d'entités OptionAssurance en liste de OptionAssuranceResponse
     */
    public List<OptionAssuranceResponse> toOptionAssuranceResponseList(List<OptionAssurance> options) {
        if (options == null) {
            return null;
        }
        return options.stream()
                .map(this::toOptionAssuranceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité SouscriptionAssurance en SouscriptionAssuranceResponse
     */
    public SouscriptionAssuranceResponse toSouscriptionAssuranceResponse(SouscriptionAssurance subscription) {
        if (subscription == null) {
            return null;
        }
        
        String vehiculeDesc = buildVehiculeDescription(subscription.getVehicule());
        
        return SouscriptionAssuranceResponse.builder()
                .id(subscription.getId())
                .utilisateurId(subscription.getUtilisateur() != null ? subscription.getUtilisateur().getId() : null)
                .utilisateurNom(subscription.getUtilisateur() != null ? subscription.getUtilisateur().getNom() : null)
                .vehiculeId(subscription.getVehicule() != null ? subscription.getVehicule().getId() : null)
                .vehiculeDescription(vehiculeDesc)
                .produitAssuranceId(subscription.getProduitAssurance() != null ? subscription.getProduitAssurance().getId() : null)
                .produitAssuranceNom(subscription.getProduitAssurance() != null ? subscription.getProduitAssurance().getNom() : null)
                .optionsSelectionnees(toOptionAssuranceResponseList(subscription.getOptionsSelectionnees()))
                .montantTotal(subscription.getMontantTotal())
                .statut(subscription.getStatut())
                .dateDebut(subscription.getDateDebut())
                .dateFin(subscription.getDateFin())
                .numeroContrat(subscription.getNumeroContrat())
                .documentUrl(subscription.getDocumentUrl())
                .paiementId(subscription.getPaiementId())
                .createdAt(subscription.getCreatedAt())
                .updatedAt(subscription.getUpdatedAt())
                .build();
    }

    /**
     * Convertit une liste d'entités SouscriptionAssurance en liste de SouscriptionAssuranceResponse
     */
    public List<SouscriptionAssuranceResponse> toSouscriptionAssuranceResponseList(List<SouscriptionAssurance> subscriptions) {
        if (subscriptions == null) {
            return null;
        }
        return subscriptions.stream()
                .map(this::toSouscriptionAssuranceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Construit une description à partir d'un véhicule
     */
    private String buildVehiculeDescription(Vehicule vehicule) {
        if (vehicule == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (vehicule.getMarque() != null) {
            sb.append(vehicule.getMarque().getNom());
        }
        if (vehicule.getModele() != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(vehicule.getModele().getNom());
        }
        return sb.length() > 0 ? sb.toString() : null;
    }
}
