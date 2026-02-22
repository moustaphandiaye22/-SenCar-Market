package com.sencarmarket.module.tradein.mapper;

import com.sencarmarket.module.tradein.dto.DemandeTradeInResponse;
import com.sencarmarket.module.tradein.dto.EstimationResponse;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités et DTOs du module TradeIn
 * Suit le principe DRY en centralisant les conversions
 */
@Component
public class TradeInMapper {

    /**
     * Convertit une entité DemandeTradeIn en DemandeTradeInResponse
     */
    public DemandeTradeInResponse toDemandeTradeInResponse(DemandeTradeIn demande) {
        if (demande == null) {
            return null;
        }
        
        String vehiculeActuelDesc = buildVehiculeDescription(demande.getVehiculeActuel());
        String vehiculeSouhaiteDesc = buildVehiculeDescription(demande.getVehiculeSouhaite());
        
        return DemandeTradeInResponse.builder()
                .id(demande.getId())
                .utilisateurId(demande.getUtilisateur() != null ? demande.getUtilisateur().getId() : null)
                .utilisateurNom(demande.getUtilisateur() != null ? demande.getUtilisateur().getNom() : null)
                .vehiculeActuelId(demande.getVehiculeActuel() != null ? demande.getVehiculeActuel().getId() : null)
                .vehiculeActuelDescription(vehiculeActuelDesc)
                .vehiculeSouhaiteId(demande.getVehiculeSouhaite() != null ? demande.getVehiculeSouhaite().getId() : null)
                .vehiculeSouhaiteDescription(vehiculeSouhaiteDesc)
                .statut(demande.getStatut())
                .prixEstime(demande.getPrixEstime())
                .prixPropose(demande.getPrixPropose())
                .kilometrageActuel(demande.getKilometrageActuel())
                .etatVehicule(demande.getEtatVehicule())
                .dateSoumission(demande.getDateSoumission())
                .dateTraitement(demande.getDateTraitement())
                .dateEvaluation(demande.getDateEvaluation())
                .motifRejet(demande.getMotifRejet())
                .commentaireAdmin(demande.getCommentaireAdmin())
                .estNotifie(demande.getEstNotifie())
                .createdAt(demande.getCreatedAt())
                .updatedAt(demande.getUpdatedAt())
                .build();
    }

    /**
     * Convertit une liste d'entités DemandeTradeIn en liste de DemandeTradeInResponse
     */
    public List<DemandeTradeInResponse> toDemandeTradeInResponseList(List<DemandeTradeIn> demandes) {
        if (demandes == null) {
            return null;
        }
        return demandes.stream()
                .map(this::toDemandeTradeInResponse)
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
