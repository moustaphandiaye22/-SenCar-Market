package com.sencarmarket.module.admin.mapper;

import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.utilisateur.dto.UtilisateurResponse;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mapper pour les conversions Admin - Respecte le principe DRY
 * Single Responsibility: только маппинг
 */
@Component
public class AdminMapper {

    // ==================== UTILISATEUR ====================

    public UtilisateurResponse toUtilisateurResponse(Utilisateur utilisateur) {
        if (utilisateur == null) {
            return null;
        }

        String typeRole = utilisateur.getTypeUtilisateur() != null 
                ? utilisateur.getTypeUtilisateur().getNom() 
                : null;
        String statutVerif = utilisateur.getStatutVerification();

        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .telephone(utilisateur.getTelephone())
                .typeUtilisateur(typeRole)
                .statutVerification(statutVerif)
                .emailVerifie(utilisateur.getEmailVerifie())
                .telephoneVerifie(utilisateur.getTelephoneVerifie())
                .doubleAuthActive(utilisateur.getDoubleAuthActive())
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }

    // ==================== VEHICULE ====================

    public VehiculeResponse toVehiculeResponse(Vehicule vehicule) {
        if (vehicule == null) {
            return null;
        }

        String marqueName = vehicule.getMarque() != null 
                ? vehicule.getMarque().getNom() 
                : null;
        String modeleName = vehicule.getModele() != null 
                ? vehicule.getModele().getNom() 
                : null;
        String statutName = vehicule.getStatut() != null 
                ? vehicule.getStatut().name() 
                : null;

        return VehiculeResponse.builder()
                .id(vehicule.getId())
                .marque(marqueName)
                .modele(modeleName)
                .anneeFabrication(vehicule.getAnneeFabrication())
                .kilometrage(vehicule.getKilometrage())
                .couleur(vehicule.getCouleur())
                .prixVente(vehicule.getPrixVente())
                .description(vehicule.getDescription())
                .numeroVin(vehicule.getNumeroVin())
                .immatriculation(vehicule.getImmatriculation())
                .statut(statutName)
                .prixNegociable(vehicule.getPrixNegociable())
                .certifie(vehicule.getCertifie())
                .estBoost(vehicule.getEstBoost())
                .boostDebut(vehicule.getBoostDebut())
                .boostFin(vehicule.getBoostFin())
                .vues(vehicule.getVues())
                .createdAt(vehicule.getCreatedAt())
                .build();
    }

    // ==================== TRANSACTION ====================

    public TransactionResponse toTransactionResponse(TransactionPortefeuille transaction) {
        if (transaction == null) {
            return null;
        }

        UUID portefeuilleId = transaction.getPortefeuille() != null 
                ? transaction.getPortefeuille().getId() 
                : null;

        return TransactionResponse.builder()
                .id(transaction.getId())
                .portefeuilleId(portefeuilleId)
                .montant(transaction.getMontant())
                .typeTransaction(transaction.getTypeTransaction())
                .statut(transaction.getStatut())
                .description(transaction.getDescription())
                .referenceExterne(transaction.getReferenceExterne())
                .dateTransaction(transaction.getDateTransaction())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
